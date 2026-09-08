package com.dev.heymimic.speaking.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.AudioState;
import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class SpeakingAttemptServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
  private static final UUID SESSION_ID = UUID.fromString("00000000-0000-0000-0000-000000000333");
  private static final UUID IDEMPOTENCY_KEY =
      UUID.fromString("00000000-0000-0000-0000-000000000222");
  private static final Instant NOW = Instant.parse("2026-09-08T02:00:00Z");
  private final SpeakingSessionStore sessions = mock(SpeakingSessionStore.class);
  private final SpeakingAttemptStore attempts = mock(SpeakingAttemptStore.class);
  private final AudioObjectStorage storage = mock(AudioObjectStorage.class);
  private final SpeakingAttemptCommitter committer = mock(SpeakingAttemptCommitter.class);
  private final IdempotencyExecutor idempotency = mock(IdempotencyExecutor.class);
  private final SpeakingAttemptService service =
      new SpeakingAttemptService(
          sessions,
          attempts,
          storage,
          committer,
          idempotency,
          new ObjectMapper(),
          Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  @SuppressWarnings("unchecked")
  void createsNumberedAttemptWithServerObjectKeyAndTenMinuteGrant() {
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(attempts.nextAttemptNumber(SESSION_ID)).thenReturn(2);
    when(storage.issueUpload(anyString(), eq("audio/webm"), eq(4096L), eq(NOW.plusSeconds(600))))
        .thenAnswer(
            invocation ->
                new AudioUploadGrant(
                    "https://storage.invalid/upload",
                    Map.of("Content-Type", "audio/webm"),
                    NOW.plusSeconds(600)));

    var created = service.create(USER_ID, IDEMPOTENCY_KEY, SESSION_ID, "audio/webm", 4096);

    assertThat(created.attempt().attemptNumber()).isEqualTo(2);
    assertThat(created.attempt().audioState()).isEqualTo("awaitingUpload");
    assertThat(created.attempt().processingState()).isEqualTo("notRequested");
    assertThat(created.expiresAt()).isEqualTo(NOW.plusSeconds(600));
    verify(attempts)
        .create(
            eq(created.attempt().id()),
            eq(SESSION_ID),
            eq(2),
            org.mockito.ArgumentMatchers.startsWith("speaking/" + USER_ID + "/" + SESSION_ID),
            eq("audio/webm"),
            eq(4096L),
            eq(NOW.plusSeconds(600)),
            eq(NOW));
  }

  @Test
  void renewsOnlyTheOwnedAwaitingUploadAttemptAtExpectedVersion() {
    UUID attemptId = UUID.randomUUID();
    SpeakingAttemptRecord attempt = attempt(attemptId);
    when(attempts.findOwned(attemptId, USER_ID)).thenReturn(Optional.of(attempt));
    when(sessions.lockOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(attempts.lockOwned(attemptId, USER_ID)).thenReturn(Optional.of(attempt));
    when(attempts.renewUpload(attemptId, USER_ID, 0, NOW.plusSeconds(600), NOW)).thenReturn(true);
    when(storage.issueUpload(anyString(), anyString(), anyLong(), any()))
        .thenReturn(
            new AudioUploadGrant(
                "https://storage.invalid/renewed", Map.of(), NOW.plusSeconds(600)));

    var renewed = service.renewUpload(USER_ID, attemptId, 0);

    assertThat(renewed.uploadUrl()).endsWith("/renewed");
    assertThat(renewed.attempt().version()).isEqualTo(1);
    verify(attempts).renewUpload(attemptId, USER_ID, 0, NOW.plusSeconds(600), NOW);
  }

  @Test
  void rejectsUnsupportedAndOversizedAudioBeforeCreatingMetadata() {
    assertThatThrownBy(
            () -> service.create(USER_ID, IDEMPOTENCY_KEY, SESSION_ID, "audio/mpeg", 4096))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("UNSUPPORTED_AUDIO_TYPE"));
    assertThatThrownBy(
            () ->
                service.create(
                    USER_ID, IDEMPOTENCY_KEY, SESSION_ID, "audio/webm", 20L * 1024 * 1024 + 1))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("AUDIO_TOO_LARGE"));
  }

  @Test
  void verifiesUploadedBytesBeforeCommittingAvailableAudio() {
    UUID attemptId = UUID.randomUUID();
    String checksum = "a".repeat(64);
    SpeakingAttemptRecord awaiting = attempt(attemptId);
    var verified = new VerifiedAudioObject("object-v1", checksum, 4096, "audio/webm", 12_000);
    SpeakingAttemptRecord available = availableAttempt(attemptId, checksum);
    when(attempts.findOwned(attemptId, USER_ID)).thenReturn(Optional.of(awaiting));
    when(sessions.findOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(storage.inspectAndSeal(awaiting.objectKey())).thenReturn(verified);
    when(committer.seal(USER_ID, awaiting, verified, NOW.plusSeconds(7 * 24 * 60 * 60), NOW))
        .thenReturn(available);

    var completed = service.completeUpload(USER_ID, attemptId, checksum.toUpperCase());

    assertThat(completed.audioState()).isEqualTo("available");
    assertThat(completed.durationMs()).isEqualTo(12_000);
    verify(committer).seal(USER_ID, awaiting, verified, NOW.plusSeconds(7 * 24 * 60 * 60), NOW);
  }

  @Test
  void rejectsCompletionWhenVerifiedChecksumDiffers() {
    UUID attemptId = UUID.randomUUID();
    SpeakingAttemptRecord awaiting = attempt(attemptId);
    when(attempts.findOwned(attemptId, USER_ID)).thenReturn(Optional.of(awaiting));
    when(sessions.findOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(storage.inspectAndSeal(awaiting.objectKey()))
        .thenReturn(
            new VerifiedAudioObject("object-v1", "b".repeat(64), 4096, "audio/webm", 12_000));

    assertThatThrownBy(() -> service.completeUpload(USER_ID, attemptId, "a".repeat(64)))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("AUDIO_CHECKSUM_MISMATCH"));
    verify(committer, never()).seal(any(), any(), any(), any(), any());
  }

  @Test
  void issuesSixtySecondPlaybackGrantOnlyForRetainedAudio() {
    UUID attemptId = UUID.randomUUID();
    SpeakingAttemptRecord available = availableAttempt(attemptId, "a".repeat(64));
    when(attempts.findOwned(attemptId, USER_ID)).thenReturn(Optional.of(available));
    when(storage.issuePlayback(available.objectKey(), "object-v1", NOW.plusSeconds(60)))
        .thenReturn(new AudioPlaybackGrant("https://storage.invalid/play", NOW.plusSeconds(60)));

    var playback = service.playback(USER_ID, attemptId);

    assertThat(playback.playbackUrl()).endsWith("/play");
    assertThat(playback.expiresAt()).isEqualTo(NOW.plusSeconds(60));
  }

  private SpeakingSessionRecord session() {
    return new SpeakingSessionRecord(
        SESSION_ID,
        USER_ID,
        UUID.randomUUID(),
        1,
        "{}",
        "Asia/Bangkok",
        SpeakingSessionStatus.IN_PROGRESS,
        null,
        0,
        NOW,
        null);
  }

  private SpeakingAttemptRecord attempt(UUID id) {
    return new SpeakingAttemptRecord(
        id,
        SESSION_ID,
        1,
        "speaking/object.upload",
        null,
        null,
        4096,
        "audio/webm",
        null,
        AudioState.AWAITING_UPLOAD,
        AttemptProcessingState.NOT_REQUESTED,
        NOW.plusSeconds(60),
        null,
        0,
        NOW);
  }

  private SpeakingAttemptRecord availableAttempt(UUID id, String checksum) {
    return new SpeakingAttemptRecord(
        id,
        SESSION_ID,
        1,
        "speaking/object.upload",
        "object-v1",
        checksum,
        4096,
        "audio/webm",
        12_000L,
        AudioState.AVAILABLE,
        AttemptProcessingState.NOT_REQUESTED,
        NOW.minusSeconds(60),
        NOW.plusSeconds(7 * 24 * 60 * 60),
        1,
        NOW);
  }
}
