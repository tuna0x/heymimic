package com.dev.heymimic.vocabulary.application;

import com.dev.heymimic.vocabulary.application.port.ReviewSessionStore;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import java.time.Clock;
import java.time.Duration;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VocabularyReviewSessionCleanupService {
  private final ReviewSessionStore sessions;
  private final VocabularyWordStore words;
  private final Clock clock;

  public VocabularyReviewSessionCleanupService(
      ReviewSessionStore sessions, VocabularyWordStore words, Clock clock) {
    this.sessions = sessions;
    this.words = words;
    this.clock = clock;
  }

  @Transactional
  public int abandonInactiveBatch(Duration inactivityTimeout, int batchSize) {
    if (inactivityTimeout == null || inactivityTimeout.isZero() || inactivityTimeout.isNegative()) {
      throw new IllegalArgumentException("Review inactivity timeout must be positive");
    }
    if (batchSize < 1 || batchSize > 1_000) {
      throw new IllegalArgumentException("Cleanup batch size must be between 1 and 1000");
    }
    var now = clock.instant();
    var inactive = sessions.lockInactive(now.minus(inactivityTimeout), batchSize);
    inactive.forEach(
        session -> {
          int itemCount = sessions.findItems(session.id()).size();
          if (!sessions.abandon(session, now)) {
            throw new IllegalStateException("Could not abandon locked inactive review session");
          }
          if (words.releaseReviewLocks(session.userId(), session.id()) != itemCount) {
            throw new IllegalStateException("Inactive review session word locks are inconsistent");
          }
        });
    return inactive.size();
  }
}
