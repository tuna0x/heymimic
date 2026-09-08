package com.dev.heymimic.vocabulary.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.vocabulary.application.port.ReviewItemRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewSessionRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewSessionStore;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import com.dev.heymimic.vocabulary.domain.ReviewSessionStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class VocabularyReviewSessionCleanupServiceTest {
  private static final Instant NOW = Instant.parse("2026-09-08T02:00:00Z");
  private final ReviewSessionStore sessions = mock(ReviewSessionStore.class);
  private final VocabularyWordStore words = mock(VocabularyWordStore.class);
  private final VocabularyReviewSessionCleanupService cleanup =
      new VocabularyReviewSessionCleanupService(sessions, words, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void abandonsLockedSessionsInactiveForConfiguredTimeoutAndReleasesTheirWords() {
    UUID sessionId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    var session =
        new ReviewSessionRecord(
            sessionId,
            userId,
            ReviewSessionStatus.IN_PROGRESS,
            "Asia/Bangkok",
            "simple-v1",
            1,
            1,
            NOW.minus(Duration.ofDays(2)),
            null,
            NOW.minus(Duration.ofHours(25)));
    var items =
        List.of(
            new ReviewItemRecord(
                UUID.randomUUID(), sessionId, UUID.randomUUID(), 0, UUID.randomUUID(), NOW),
            new ReviewItemRecord(UUID.randomUUID(), sessionId, UUID.randomUUID(), 1, null, null));
    when(sessions.lockInactive(NOW.minus(Duration.ofHours(24)), 100)).thenReturn(List.of(session));
    when(sessions.findItems(sessionId)).thenReturn(items);
    when(sessions.abandon(session, NOW)).thenReturn(true);
    when(words.releaseReviewLocks(userId, sessionId)).thenReturn(2);

    assertThat(cleanup.abandonInactiveBatch(Duration.ofHours(24), 100)).isEqualTo(1);

    verify(sessions).abandon(session, NOW);
    verify(words).releaseReviewLocks(userId, sessionId);
  }
}
