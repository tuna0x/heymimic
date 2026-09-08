package com.dev.heymimic.speaking.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.application.port.SpeakingSessionRecord;
import com.dev.heymimic.speaking.application.port.SpeakingSessionStore;
import com.dev.heymimic.speaking.application.port.VerifiedAudioObject;
import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.AudioState;
import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SpeakingAttemptCommitterTest {
  private static final UUID USER_ID = UUID.randomUUID();
  private static final UUID SESSION_ID = UUID.randomUUID();
  private static final UUID ATTEMPT_ID = UUID.randomUUID();
  private static final Instant NOW = Instant.parse("2026-09-08T02:00:00Z");
  private static final Instant RETENTION = NOW.plusSeconds(604_800);
  private static final String CHECKSUM = "a".repeat(64);
  private final SpeakingSessionStore sessions = mock(SpeakingSessionStore.class);
  private final SpeakingAttemptStore attempts = mock(SpeakingAttemptStore.class);
  private final SpeakingAttemptCommitter committer =
      new SpeakingAttemptCommitter(sessions, attempts);

  @Test
  void locksSessionThenAttemptAndSealsAtCurrentVersion() {
    SpeakingAttemptRecord awaiting = attempt(AudioState.AWAITING_UPLOAD, null, 3);
    VerifiedAudioObject verified =
        new VerifiedAudioObject("object-v1", CHECKSUM, 4096, "audio/webm", 10_000);
    when(sessions.lockOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(attempts.lockOwned(ATTEMPT_ID, USER_ID)).thenReturn(Optional.of(awaiting));
    when(attempts.seal(ATTEMPT_ID, USER_ID, 3, verified, RETENTION, NOW)).thenReturn(true);

    SpeakingAttemptRecord sealed = committer.seal(USER_ID, awaiting, verified, RETENTION, NOW);

    assertThat(sealed.audioState()).isEqualTo(AudioState.AVAILABLE);
    assertThat(sealed.version()).isEqualTo(4);
    assertThat(sealed.retentionUntil()).isEqualTo(RETENTION);
    verify(attempts).seal(ATTEMPT_ID, USER_ID, 3, verified, RETENTION, NOW);
  }

  @Test
  void treatsSameChecksumOnAlreadyAvailableAttemptAsIdempotentReplay() {
    SpeakingAttemptRecord prepared = attempt(AudioState.AWAITING_UPLOAD, null, 2);
    SpeakingAttemptRecord available = attempt(AudioState.AVAILABLE, CHECKSUM, 3);
    VerifiedAudioObject verified =
        new VerifiedAudioObject("object-v1", CHECKSUM, 4096, "audio/webm", 10_000);
    when(sessions.lockOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(attempts.lockOwned(ATTEMPT_ID, USER_ID)).thenReturn(Optional.of(available));

    assertThat(committer.seal(USER_ID, prepared, verified, RETENTION, NOW)).isSameAs(available);
    verify(attempts, never()).seal(ATTEMPT_ID, USER_ID, 3, verified, RETENTION, NOW);
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

  private SpeakingAttemptRecord attempt(AudioState audioState, String checksum, long version) {
    return new SpeakingAttemptRecord(
        ATTEMPT_ID,
        SESSION_ID,
        1,
        "speaking/object.upload",
        audioState == AudioState.AVAILABLE ? "object-v1" : null,
        checksum,
        4096,
        "audio/webm",
        audioState == AudioState.AVAILABLE ? 10_000L : null,
        audioState,
        AttemptProcessingState.NOT_REQUESTED,
        NOW.plusSeconds(600),
        audioState == AudioState.AVAILABLE ? RETENTION : null,
        version,
        NOW);
  }
}
