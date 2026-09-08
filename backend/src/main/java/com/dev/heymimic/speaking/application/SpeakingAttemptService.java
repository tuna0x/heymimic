package com.dev.heymimic.speaking.application;

import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.application.port.AudioPlaybackGrant;
import com.dev.heymimic.speaking.application.port.AudioUploadGrant;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.application.port.SpeakingSessionRecord;
import com.dev.heymimic.speaking.application.port.SpeakingSessionStore;
import com.dev.heymimic.speaking.application.port.VerifiedAudioObject;
import com.dev.heymimic.speaking.application.publicapi.AttemptPlaybackView;
import com.dev.heymimic.speaking.application.publicapi.AttemptUploadView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingAttemptView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingAttempts;
import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.AudioState;
import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class SpeakingAttemptService implements SpeakingAttempts {
  private static final long MAX_SIZE_BYTES = 20L * 1024 * 1024;
  private static final Duration UPLOAD_TTL = Duration.ofMinutes(10);
  private static final Duration PLAYBACK_TTL = Duration.ofSeconds(60);
  private static final Duration AUDIO_RETENTION = Duration.ofDays(7);
  private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(1);
  private static final long MIN_DURATION_MS = 2_000;
  private static final long MAX_DURATION_MS = 180_000;
  private static final Pattern SHA_256 = Pattern.compile("^[0-9a-f]{64}$");
  private static final Set<String> MIME_TYPES =
      Set.of("audio/webm", "audio/ogg", "audio/mp4", "audio/wav");
  private final SpeakingSessionStore sessions;
  private final SpeakingAttemptStore attempts;
  private final AudioObjectStorage storage;
  private final SpeakingAttemptCommitter committer;
  private final IdempotencyExecutor idempotency;
  private final ObjectMapper objectMapper;
  private final Clock clock;

  public SpeakingAttemptService(
      SpeakingSessionStore sessions,
      SpeakingAttemptStore attempts,
      AudioObjectStorage storage,
      SpeakingAttemptCommitter committer,
      IdempotencyExecutor idempotency,
      ObjectMapper objectMapper,
      Clock clock) {
    this.sessions = sessions;
    this.attempts = attempts;
    this.storage = storage;
    this.committer = committer;
    this.idempotency = idempotency;
    this.objectMapper = objectMapper;
    this.clock = clock;
  }

  @Override
  public AttemptUploadView create(
      UUID userId, UUID idempotencyKey, UUID sessionId, String mimeType, long sizeBytes) {
    validateUpload(mimeType, sizeBytes);
    var command =
        new IdempotencyCommand(
            userId,
            "speaking.attempt.create",
            idempotencyKey,
            sessionId + ":" + mimeType + ":" + sizeBytes,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> createFresh(userId, sessionId, mimeType, sizeBytes));
    UploadPayload payload = read(result.bodyJson(), UploadPayload.class);
    return uploadView(payload, result.replayed());
  }

  private IdempotentResponse createFresh(
      UUID userId, UUID sessionId, String mimeType, long sizeBytes) {
    SpeakingSessionRecord session = lockInProgressSession(userId, sessionId);
    int attemptNumber = attempts.nextAttemptNumber(session.id());
    UUID attemptId = UUID.randomUUID();
    String objectKey = "speaking/" + userId + "/" + sessionId + "/" + attemptId + ".upload";
    Instant now = clock.instant();
    Instant expiresAt = now.plus(UPLOAD_TTL);
    attempts.create(
        attemptId, sessionId, attemptNumber, objectKey, mimeType, sizeBytes, expiresAt, now);
    AudioUploadGrant grant = storage.issueUpload(objectKey, mimeType, sizeBytes, expiresAt);
    var attempt =
        new SpeakingAttemptRecord(
            attemptId,
            sessionId,
            attemptNumber,
            objectKey,
            null,
            null,
            sizeBytes,
            mimeType,
            null,
            AudioState.AWAITING_UPLOAD,
            AttemptProcessingState.NOT_REQUESTED,
            expiresAt,
            null,
            0,
            now);
    return IdempotentResponse.fresh(
        HttpStatus.CREATED.value(), write(new UploadPayload(view(attempt), grant)));
  }

  @Override
  @Transactional
  public AttemptUploadView renewUpload(UUID userId, UUID attemptId, long expectedVersion) {
    SpeakingAttemptRecord found =
        attempts.findOwned(attemptId, userId).orElseThrow(this::attemptNotFound);
    lockInProgressSession(userId, found.sessionId());
    SpeakingAttemptRecord attempt =
        attempts.lockOwned(attemptId, userId).orElseThrow(this::attemptNotFound);
    if (attempt.audioState() != AudioState.AWAITING_UPLOAD
        || attempt.version() != expectedVersion) {
      throw attemptConflict();
    }
    Instant now = clock.instant();
    Instant expiresAt = now.plus(UPLOAD_TTL);
    if (!attempts.renewUpload(attempt.id(), userId, expectedVersion, expiresAt, now)) {
      throw attemptConflict();
    }
    AudioUploadGrant grant =
        storage.issueUpload(
            attempt.objectKey(), attempt.mimeType(), attempt.sizeBytes(), expiresAt);
    var updated =
        new SpeakingAttemptRecord(
            attempt.id(),
            attempt.sessionId(),
            attempt.attemptNumber(),
            attempt.objectKey(),
            attempt.objectVersion(),
            attempt.checksum(),
            attempt.sizeBytes(),
            attempt.mimeType(),
            attempt.durationMs(),
            attempt.audioState(),
            attempt.processingState(),
            expiresAt,
            attempt.retentionUntil(),
            attempt.version() + 1,
            attempt.createdAt());
    return uploadView(new UploadPayload(view(updated), grant), false);
  }

  @Override
  public SpeakingAttemptView completeUpload(UUID userId, UUID attemptId, String checksumSha256) {
    String requestedChecksum = normalizeChecksum(checksumSha256);
    SpeakingAttemptRecord prepared =
        attempts.findOwned(attemptId, userId).orElseThrow(this::attemptNotFound);
    if (prepared.audioState() == AudioState.AVAILABLE) {
      if (requestedChecksum.equals(prepared.checksum())) {
        return view(prepared);
      }
      throw uploadStateConflict();
    }
    if (prepared.audioState() != AudioState.AWAITING_UPLOAD) {
      throw uploadStateConflict();
    }
    SpeakingSessionRecord session =
        sessions
            .findOwned(prepared.sessionId(), userId)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "SPEAKING_SESSION_NOT_FOUND",
                        "Speaking session not found"));
    if (session.status() != SpeakingSessionStatus.IN_PROGRESS) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "SPEAKING_SESSION_TERMINAL",
          "Speaking attempts cannot change after the session ends");
    }

    VerifiedAudioObject verified = verify(prepared, storage.inspectAndSeal(prepared.objectKey()));
    if (!requestedChecksum.equals(verified.checksumSha256())) {
      throw new ApiException(
          HttpStatus.UNPROCESSABLE_CONTENT,
          "AUDIO_CHECKSUM_MISMATCH",
          "Uploaded audio checksum does not match the completion request");
    }
    Instant now = clock.instant();
    return view(committer.seal(userId, prepared, verified, now.plus(AUDIO_RETENTION), now));
  }

  @Override
  public AttemptPlaybackView playback(UUID userId, UUID attemptId) {
    SpeakingAttemptRecord attempt =
        attempts.findOwned(attemptId, userId).orElseThrow(this::attemptNotFound);
    Instant now = clock.instant();
    if (attempt.audioState() == AudioState.DELETED
        || (attempt.retentionUntil() != null && !attempt.retentionUntil().isAfter(now))) {
      throw new ApiException(
          HttpStatus.GONE, "AUDIO_EXPIRED", "Speaking attempt audio is no longer retained");
    }
    if (attempt.audioState() != AudioState.AVAILABLE || attempt.objectVersion() == null) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "AUDIO_NOT_AVAILABLE",
          "Speaking attempt audio is not available for playback");
    }
    AudioPlaybackGrant grant =
        storage.issuePlayback(attempt.objectKey(), attempt.objectVersion(), now.plus(PLAYBACK_TTL));
    return new AttemptPlaybackView(grant.playbackUrl(), grant.expiresAt());
  }

  private VerifiedAudioObject verify(
      SpeakingAttemptRecord declared, VerifiedAudioObject inspected) {
    if (inspected == null
        || inspected.objectVersion() == null
        || inspected.objectVersion().isBlank()
        || inspected.objectVersion().length() > 200) {
      throw invalidAudio("Storage did not return a valid immutable object version");
    }
    String checksum = normalizeChecksum(inspected.checksumSha256());
    if (inspected.sizeBytes() != declared.sizeBytes()) {
      throw invalidAudio("Uploaded audio size differs from the declared size");
    }
    if (!declared.mimeType().equals(inspected.detectedMimeType())
        || !MIME_TYPES.contains(inspected.detectedMimeType())) {
      throw invalidAudio("Uploaded content does not match the declared audio type");
    }
    if (inspected.durationMs() < MIN_DURATION_MS || inspected.durationMs() > MAX_DURATION_MS) {
      throw invalidAudio("Audio duration must be between 2 and 180 seconds");
    }
    return new VerifiedAudioObject(
        inspected.objectVersion(),
        checksum,
        inspected.sizeBytes(),
        inspected.detectedMimeType(),
        inspected.durationMs());
  }

  private String normalizeChecksum(String checksum) {
    String normalized = checksum == null ? "" : checksum.trim().toLowerCase(java.util.Locale.ROOT);
    if (!SHA_256.matcher(normalized).matches()) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_AUDIO_CHECKSUM",
          "checksumSha256 must be a 64-character hexadecimal SHA-256");
    }
    return normalized;
  }

  private ApiException invalidAudio(String message) {
    return new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "INVALID_AUDIO_OBJECT", message);
  }

  private ApiException uploadStateConflict() {
    return new ApiException(
        HttpStatus.CONFLICT,
        "SPEAKING_ATTEMPT_STATE_CONFLICT",
        "Speaking attempt can no longer accept this upload");
  }

  private SpeakingSessionRecord lockInProgressSession(UUID userId, UUID sessionId) {
    SpeakingSessionRecord session =
        sessions
            .lockOwned(sessionId, userId)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "SPEAKING_SESSION_NOT_FOUND",
                        "Speaking session not found"));
    if (session.status() != SpeakingSessionStatus.IN_PROGRESS) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "SPEAKING_SESSION_TERMINAL",
          "Speaking attempts cannot change after the session ends");
    }
    return session;
  }

  private void validateUpload(String mimeType, long sizeBytes) {
    if (!MIME_TYPES.contains(mimeType)) {
      throw new ApiException(
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          "UNSUPPORTED_AUDIO_TYPE",
          "Audio type must be webm, ogg, mp4 or wav");
    }
    if (sizeBytes < 1) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "INVALID_AUDIO_SIZE", "Audio size must be positive");
    }
    if (sizeBytes > MAX_SIZE_BYTES) {
      throw new ApiException(
          HttpStatus.CONTENT_TOO_LARGE, "AUDIO_TOO_LARGE", "Audio must not exceed 20 MiB");
    }
  }

  private SpeakingAttemptView view(SpeakingAttemptRecord attempt) {
    return new SpeakingAttemptView(
        attempt.id(),
        attempt.sessionId(),
        attempt.attemptNumber(),
        attempt.mimeType(),
        attempt.sizeBytes(),
        attempt.durationMs(),
        attempt.audioState().apiValue(),
        attempt.processingState().apiValue(),
        attempt.version(),
        attempt.createdAt());
  }

  private AttemptUploadView uploadView(UploadPayload payload, boolean replayed) {
    return new AttemptUploadView(
        payload.attempt(),
        payload.grant().uploadUrl(),
        payload.grant().requiredHeaders(),
        payload.grant().expiresAt(),
        replayed);
  }

  private ApiException attemptNotFound() {
    return new ApiException(
        HttpStatus.NOT_FOUND, "SPEAKING_ATTEMPT_NOT_FOUND", "Speaking attempt not found");
  }

  private ApiException attemptConflict() {
    return new ApiException(
        HttpStatus.CONFLICT,
        "SPEAKING_ATTEMPT_VERSION_CONFLICT",
        "Speaking attempt changed; reload it before retrying");
  }

  private String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize speaking attempt", exception);
    }
  }

  private <T> T read(String value, Class<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize speaking attempt", exception);
    }
  }

  private record UploadPayload(SpeakingAttemptView attempt, AudioUploadGrant grant) {}
}
