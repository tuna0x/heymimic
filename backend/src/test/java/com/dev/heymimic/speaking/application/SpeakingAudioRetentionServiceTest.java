package com.dev.heymimic.speaking.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.AudioState;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SpeakingAudioRetentionServiceTest {
  private static final Instant NOW = Instant.parse("2026-09-08T02:00:00Z");
  private final SpeakingAttemptStore attempts = mock(SpeakingAttemptStore.class);
  private final AudioObjectStorage storage = mock(AudioObjectStorage.class);
  private final SpeakingAudioRetentionCommitter committer =
      mock(SpeakingAudioRetentionCommitter.class);
  private final SpeakingAudioRetentionService cleanup =
      new SpeakingAudioRetentionService(
          attempts, storage, committer, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void deletesObjectBeforeMarkingMetadataDeleted() {
    SpeakingAttemptRecord expired = expiredAttempt("one");
    when(attempts.findExpiredAudio(NOW, 100)).thenReturn(List.of(expired));
    when(committer.markDeleted(expired, NOW)).thenReturn(true);

    var result = cleanup.cleanupExpiredBatch(100);

    assertThat(result.inspected()).isEqualTo(1);
    assertThat(result.deleted()).isEqualTo(1);
    assertThat(result.failed()).isZero();
    var ordered = org.mockito.Mockito.inOrder(storage, committer);
    ordered.verify(storage).delete(expired.objectKey(), expired.objectVersion());
    ordered.verify(committer).markDeleted(expired, NOW);
  }

  @Test
  void continuesBatchAndLeavesMetadataRetryableWhenStorageFails() {
    SpeakingAttemptRecord failing = expiredAttempt("failing");
    SpeakingAttemptRecord succeeding = expiredAttempt("succeeding");
    when(attempts.findExpiredAudio(NOW, 10)).thenReturn(List.of(failing, succeeding));
    doThrow(new IllegalStateException("storage unavailable"))
        .when(storage)
        .delete(failing.objectKey(), failing.objectVersion());
    when(committer.markDeleted(succeeding, NOW)).thenReturn(true);

    var result = cleanup.cleanupExpiredBatch(10);

    assertThat(result.inspected()).isEqualTo(2);
    assertThat(result.deleted()).isEqualTo(1);
    assertThat(result.failed()).isEqualTo(1);
    verify(storage).delete(succeeding.objectKey(), succeeding.objectVersion());
    verify(committer).markDeleted(succeeding, NOW);
  }

  @Test
  void rejectsUnsafeBatchSizes() {
    assertThatThrownBy(() -> cleanup.cleanupExpiredBatch(0))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> cleanup.cleanupExpiredBatch(1_001))
        .isInstanceOf(IllegalArgumentException.class);
  }

  private SpeakingAttemptRecord expiredAttempt(String suffix) {
    return new SpeakingAttemptRecord(
        UUID.randomUUID(),
        UUID.randomUUID(),
        1,
        "speaking/" + suffix,
        "version-" + suffix,
        "a".repeat(64),
        4096,
        "audio/webm",
        10_000L,
        AudioState.AVAILABLE,
        AttemptProcessingState.COMPLETED,
        NOW.minusSeconds(700_000),
        NOW.minusSeconds(1),
        2,
        NOW.minusSeconds(700_000));
  }
}
