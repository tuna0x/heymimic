package com.dev.heymimic.speaking.application;

import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.application.port.SpeakingSessionStore;
import com.dev.heymimic.speaking.application.port.VerifiedAudioObject;
import com.dev.heymimic.speaking.domain.AudioState;
import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SpeakingAttemptCommitter {
  private final SpeakingSessionStore sessions;
  private final SpeakingAttemptStore attempts;

  public SpeakingAttemptCommitter(SpeakingSessionStore sessions, SpeakingAttemptStore attempts) {
    this.sessions = sessions;
    this.attempts = attempts;
  }

  @Transactional
  public SpeakingAttemptRecord seal(
      UUID userId,
      SpeakingAttemptRecord prepared,
      VerifiedAudioObject verified,
      Instant retentionUntil,
      Instant now) {
    var session =
        sessions
            .lockOwned(prepared.sessionId(), userId)
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

    SpeakingAttemptRecord locked =
        attempts
            .lockOwned(prepared.id(), userId)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "SPEAKING_ATTEMPT_NOT_FOUND",
                        "Speaking attempt not found"));
    if (locked.audioState() == AudioState.AVAILABLE) {
      if (verified.checksumSha256().equals(locked.checksum())) {
        return locked;
      }
      throw conflict();
    }
    if (locked.audioState() != AudioState.AWAITING_UPLOAD
        || !locked.objectKey().equals(prepared.objectKey())) {
      throw conflict();
    }
    if (!attempts.seal(locked.id(), userId, locked.version(), verified, retentionUntil, now)) {
      throw conflict();
    }
    return new SpeakingAttemptRecord(
        locked.id(),
        locked.sessionId(),
        locked.attemptNumber(),
        locked.objectKey(),
        verified.objectVersion(),
        verified.checksumSha256(),
        verified.sizeBytes(),
        verified.detectedMimeType(),
        verified.durationMs(),
        AudioState.AVAILABLE,
        locked.processingState(),
        locked.uploadExpiresAt(),
        retentionUntil,
        locked.version() + 1,
        locked.createdAt());
  }

  private ApiException conflict() {
    return new ApiException(
        HttpStatus.CONFLICT,
        "SPEAKING_ATTEMPT_STATE_CONFLICT",
        "Speaking attempt can no longer accept this upload");
  }
}
