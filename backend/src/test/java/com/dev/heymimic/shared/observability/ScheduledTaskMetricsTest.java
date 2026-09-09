package com.dev.heymimic.shared.observability;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class ScheduledTaskMetricsTest {
  @Test
  void recordsRunsItemsAndLastSuccessfulExecution() {
    var registry = new SimpleMeterRegistry();
    Instant now = Instant.parse("2026-09-08T10:00:00Z");
    var metrics = new ScheduledTaskMetrics(registry, Clock.fixed(now, ZoneOffset.UTC));

    metrics.recordItems("audio_retention", "deleted", 3);
    metrics.recordSuccess("audio_retention");
    metrics.recordFailure("audio_retention");

    assertThat(
            registry
                .get("heymimic.maintenance.items")
                .tags("task", "audio_retention", "outcome", "deleted")
                .counter()
                .count())
        .isEqualTo(3);
    assertThat(
            registry
                .get("heymimic.maintenance.runs")
                .tags("task", "audio_retention", "outcome", "success")
                .counter()
                .count())
        .isEqualTo(1);
    assertThat(
            registry
                .get("heymimic.maintenance.runs")
                .tags("task", "audio_retention", "outcome", "failure")
                .counter()
                .count())
        .isEqualTo(1);
    assertThat(
            registry
                .get("heymimic.maintenance.last.success.epoch.seconds")
                .tag("task", "audio_retention")
                .gauge()
                .value())
        .isEqualTo(now.getEpochSecond());
  }
}
