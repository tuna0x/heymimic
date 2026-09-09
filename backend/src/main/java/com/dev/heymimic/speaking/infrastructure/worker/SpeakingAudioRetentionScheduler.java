package com.dev.heymimic.speaking.infrastructure.worker;

import com.dev.heymimic.shared.observability.ScheduledTaskMetrics;
import com.dev.heymimic.speaking.application.SpeakingAudioRetentionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "heymimic.speaking.audio-retention-cleanup",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true)
public class SpeakingAudioRetentionScheduler {
  private static final String TASK_NAME = "speaking_audio_retention";
  private static final Logger log = LoggerFactory.getLogger(SpeakingAudioRetentionScheduler.class);
  private final SpeakingAudioRetentionService cleanup;
  private final ScheduledTaskMetrics metrics;
  private final int batchSize;

  public SpeakingAudioRetentionScheduler(
      SpeakingAudioRetentionService cleanup,
      ScheduledTaskMetrics metrics,
      @Value("${heymimic.speaking.audio-retention-cleanup.batch-size:100}") int batchSize) {
    this.cleanup = cleanup;
    this.metrics = metrics;
    this.batchSize = batchSize;
  }

  @Scheduled(fixedDelayString = "${heymimic.speaking.audio-retention-cleanup.interval:PT1H}")
  public void cleanup() {
    try {
      var result = cleanup.cleanupExpiredBatch(batchSize);
      metrics.recordItems(TASK_NAME, "inspected", result.inspected());
      metrics.recordItems(TASK_NAME, "deleted", result.deleted());
      metrics.recordItems(TASK_NAME, "failed", result.failed());
      metrics.recordSuccess(TASK_NAME);
      if (result.inspected() > 0) {
        log.info(
            "Processed expired speaking audio: inspected={}, deleted={}, failed={}",
            result.inspected(),
            result.deleted(),
            result.failed());
      }
    } catch (RuntimeException exception) {
      metrics.recordFailure(TASK_NAME);
      throw exception;
    }
  }
}
