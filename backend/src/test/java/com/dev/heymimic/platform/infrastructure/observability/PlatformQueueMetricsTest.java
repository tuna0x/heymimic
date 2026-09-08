package com.dev.heymimic.platform.infrastructure.observability;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class PlatformQueueMetricsTest {
  private static final Instant NOW = Instant.parse("2026-09-08T10:00:00Z");

  @Test
  void publishesQueueSnapshotAndRefreshHealth() {
    var observations = mock(PlatformQueueObservationStore.class);
    when(observations.observeJobs(NOW))
        .thenReturn(new PlatformQueueObservationStore.QueueObservation(4, 301));
    when(observations.observeDeliveries(NOW))
        .thenReturn(new PlatformQueueObservationStore.QueueObservation(2, 75));
    var registry = new SimpleMeterRegistry();
    var metrics =
        new PlatformQueueMetrics(observations, registry, Clock.fixed(NOW, ZoneOffset.UTC));

    metrics.refresh();

    assertThat(registry.get("heymimic.platform.jobs.due").gauge().value()).isEqualTo(4);
    assertThat(registry.get("heymimic.platform.jobs.oldest.due.age.seconds").gauge().value())
        .isEqualTo(301);
    assertThat(registry.get("heymimic.platform.events.deliveries.due").gauge().value())
        .isEqualTo(2);
    assertThat(registry.get("heymimic.platform.events.oldest.delivery.lag.seconds").gauge().value())
        .isEqualTo(75);
    assertThat(
            registry
                .get("heymimic.platform.queue.observations")
                .tag("outcome", "success")
                .counter()
                .count())
        .isEqualTo(1);
    assertThat(
            registry
                .get("heymimic.platform.queue.observations.last.success.epoch.seconds")
                .gauge()
                .value())
        .isEqualTo(NOW.getEpochSecond());
  }

  @Test
  void keepsLastGoodSnapshotAndCountsRefreshFailure() {
    var observations = mock(PlatformQueueObservationStore.class);
    when(observations.observeJobs(NOW))
        .thenReturn(new PlatformQueueObservationStore.QueueObservation(1, 20))
        .thenThrow(new IllegalStateException("database unavailable"));
    when(observations.observeDeliveries(NOW))
        .thenReturn(new PlatformQueueObservationStore.QueueObservation(3, 40));
    var registry = new SimpleMeterRegistry();
    var metrics =
        new PlatformQueueMetrics(observations, registry, Clock.fixed(NOW, ZoneOffset.UTC));

    metrics.refresh();
    metrics.refresh();

    assertThat(registry.get("heymimic.platform.jobs.due").gauge().value()).isEqualTo(1);
    assertThat(registry.get("heymimic.platform.events.deliveries.due").gauge().value())
        .isEqualTo(3);
    assertThat(
            registry
                .get("heymimic.platform.queue.observations")
                .tag("outcome", "failure")
                .counter()
                .count())
        .isEqualTo(1);
  }
}
