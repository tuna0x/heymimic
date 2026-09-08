package com.dev.heymimic.vocabulary.infrastructure.worker;

import com.dev.heymimic.shared.observability.ScheduledTaskMetrics;
import com.dev.heymimic.vocabulary.application.VocabularyReviewSessionCleanupService;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "heymimic.vocabulary.review-session-cleanup",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true)
public class ReviewSessionCleanupScheduler {
  private static final String TASK_NAME = "vocabulary_review_session_cleanup";
  private static final Logger log = LoggerFactory.getLogger(ReviewSessionCleanupScheduler.class);
  private final VocabularyReviewSessionCleanupService cleanup;
  private final ScheduledTaskMetrics metrics;
  private final Duration inactivityTimeout;
  private final int batchSize;

  public ReviewSessionCleanupScheduler(
      VocabularyReviewSessionCleanupService cleanup,
      ScheduledTaskMetrics metrics,
      @Value("${heymimic.vocabulary.review-session-cleanup.inactivity-timeout:PT24H}")
          Duration inactivityTimeout,
      @Value("${heymimic.vocabulary.review-session-cleanup.batch-size:100}") int batchSize) {
    this.cleanup = cleanup;
    this.metrics = metrics;
    this.inactivityTimeout = inactivityTimeout;
    this.batchSize = batchSize;
  }

  @Scheduled(fixedDelayString = "${heymimic.vocabulary.review-session-cleanup.interval:PT15M}")
  public void cleanup() {
    try {
      int abandoned = cleanup.abandonInactiveBatch(inactivityTimeout, batchSize);
      metrics.recordItems(TASK_NAME, "abandoned", abandoned);
      metrics.recordSuccess(TASK_NAME);
      if (abandoned > 0) {
        log.info("Abandoned inactive vocabulary review sessions: count={}", abandoned);
      }
    } catch (RuntimeException exception) {
      metrics.recordFailure(TASK_NAME);
      throw exception;
    }
  }
}
