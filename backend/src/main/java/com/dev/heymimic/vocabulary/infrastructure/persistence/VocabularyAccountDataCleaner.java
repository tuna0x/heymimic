package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class VocabularyAccountDataCleaner implements AccountDataCleaner {
  private final JpaVocabularyWordRepository words;
  private final JpaContextAnalysisRepository analyses;
  private final JpaReviewSessionRepository reviewSessions;
  private final JpaReviewItemRepository reviewItems;
  private final JpaReviewEventRepository reviewEvents;

  public VocabularyAccountDataCleaner(
      JpaVocabularyWordRepository words,
      JpaContextAnalysisRepository analyses,
      JpaReviewSessionRepository reviewSessions,
      JpaReviewItemRepository reviewItems,
      JpaReviewEventRepository reviewEvents) {
    this.words = words;
    this.analyses = analyses;
    this.reviewSessions = reviewSessions;
    this.reviewItems = reviewItems;
    this.reviewEvents = reviewEvents;
  }

  @Override
  public String cleanerName() {
    return "vocabulary";
  }

  @Override
  public int order() {
    return 400;
  }

  @Override
  @Transactional
  public void clean(UUID userId, UUID deletionJobId) {
    analyses.deleteByUserId(userId);
    analyses.flush();
    words.clearReviewLocks(userId);
    reviewItems.clearActiveEventsForUser(userId);
    reviewEvents.deleteByUserId(userId);
    reviewSessions.deleteByUserId(userId);
    reviewSessions.flush();
    words.deleteByUserId(userId);
    words.flush();
  }
}
