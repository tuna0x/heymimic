package com.dev.heymimic.platform.infrastructure.observability;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;

class PlatformWorkerMetricsTest {
  @Test
  void recordsBoundedWorkerOutcomeAndDurationMetrics() {
    var registry = new SimpleMeterRegistry();
    var metrics = new PlatformWorkerMetrics(registry);

    metrics.recordJob("SPEAKING_EVALUATION", "retry_scheduled", 10_000);
    metrics.recordJobHeartbeat("SPEAKING_EVALUATION", "renewed");
    metrics.recordEvent("progress-speaking-v1", "succeeded", 20_000);

    assertThat(
            registry
                .get("heymimic.platform.jobs.processed")
                .tags("type", "SPEAKING_EVALUATION", "outcome", "retry_scheduled")
                .counter()
                .count())
        .isEqualTo(1);
    assertThat(
            registry
                .get("heymimic.platform.jobs.duration")
                .tags("type", "SPEAKING_EVALUATION", "outcome", "retry_scheduled")
                .timer()
                .count())
        .isEqualTo(1);
    assertThat(
            registry
                .get("heymimic.platform.jobs.heartbeats")
                .tags("type", "SPEAKING_EVALUATION", "outcome", "renewed")
                .counter()
                .count())
        .isEqualTo(1);
    assertThat(
            registry
                .get("heymimic.platform.events.processed")
                .tags("consumer", "progress-speaking-v1", "outcome", "succeeded")
                .counter()
                .count())
        .isEqualTo(1);
  }
}
