package com.dev.heymimic.vocabulary.infrastructure.worker;

import com.dev.heymimic.shared.observability.ScheduledTaskMetrics;
import com.dev.heymimic.vocabulary.application.VocabularyContextAnalysisCleanupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "heymimic.vocabulary.context-analysis-cleanup",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true)
public class ContextAnalysisCleanupScheduler {
  private static final String TASK_NAME = "vocabulary_context_analysis_cleanup";
  private static final Logger log = LoggerFactory.getLogger(ContextAnalysisCleanupScheduler.class);
  private final VocabularyContextAnalysisCleanupService cleanup;
  private final ScheduledTaskMetrics metrics;
  private final int batchSize;

  public ContextAnalysisCleanupScheduler(
      VocabularyContextAnalysisCleanupService cleanup,
      ScheduledTaskMetrics metrics,
      @Value("${heymimic.vocabulary.context-analysis-cleanup.batch-size:100}") int batchSize) {
    this.cleanup = cleanup;
    this.metrics = metrics;
    this.batchSize = batchSize;
  }

  @Scheduled(fixedDelayString = "${heymimic.vocabulary.context-analysis-cleanup.interval:PT1H}")
  public void cleanup() {
    try {
      int deleted = cleanup.cleanupExpiredBatch(batchSize);
      metrics.recordItems(TASK_NAME, "deleted", deleted);
      metrics.recordSuccess(TASK_NAME);
      if (deleted > 0) {
        log.info("Deleted expired context analyses: count={}", deleted);
      }
    } catch (RuntimeException exception) {
      metrics.recordFailure(TASK_NAME);
      throw exception;
    }
  }
}
