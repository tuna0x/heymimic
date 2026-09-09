package com.dev.heymimic.platform.infrastructure.observability;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Clock;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "heymimic.observability.queue-metrics",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true)
public class PlatformQueueMetrics {
  private static final Logger log = LoggerFactory.getLogger(PlatformQueueMetrics.class);

  private final PlatformQueueObservationStore observations;
  private final Clock clock;
  private final Counter successfulRefreshes;
  private final Counter failedRefreshes;
  private final AtomicLong dueJobs = new AtomicLong();
  private final AtomicLong oldestDueJobAgeSeconds = new AtomicLong();
  private final AtomicLong dueDeliveries = new AtomicLong();
  private final AtomicLong oldestDeliveryLagSeconds = new AtomicLong();
  private final AtomicLong lastSuccessEpochSeconds = new AtomicLong();

  public PlatformQueueMetrics(
      PlatformQueueObservationStore observations, MeterRegistry registry, Clock clock) {
    this.observations = observations;
    this.clock = clock;
    this.successfulRefreshes =
        registry.counter("heymimic.platform.queue.observations", "outcome", "success");
    this.failedRefreshes =
        registry.counter("heymimic.platform.queue.observations", "outcome", "failure");
    registerGauges(registry);
  }

  @Scheduled(
      fixedDelayString = "${heymimic.observability.queue-metrics.interval:PT30S}",
      initialDelayString = "${heymimic.observability.queue-metrics.initial-delay:PT5S}")
  public void refresh() {
    try {
      var now = clock.instant();
      var jobs = observations.observeJobs(now);
      var deliveries = observations.observeDeliveries(now);
      dueJobs.set(jobs.dueCount());
      oldestDueJobAgeSeconds.set(jobs.oldestAgeSeconds());
      dueDeliveries.set(deliveries.dueCount());
      oldestDeliveryLagSeconds.set(deliveries.oldestAgeSeconds());
      lastSuccessEpochSeconds.set(now.getEpochSecond());
      successfulRefreshes.increment();
    } catch (RuntimeException exception) {
      failedRefreshes.increment();
      log.warn("Could not refresh platform queue metrics", exception);
    }
  }

  private void registerGauges(MeterRegistry registry) {
    Gauge.builder("heymimic.platform.jobs.due", dueJobs, AtomicLong::get).register(registry);
    Gauge.builder(
            "heymimic.platform.jobs.oldest.due.age.seconds",
            oldestDueJobAgeSeconds,
            AtomicLong::get)
        .register(registry);
    Gauge.builder("heymimic.platform.events.deliveries.due", dueDeliveries, AtomicLong::get)
        .register(registry);
    Gauge.builder(
            "heymimic.platform.events.oldest.delivery.lag.seconds",
            oldestDeliveryLagSeconds,
            AtomicLong::get)
        .register(registry);
    Gauge.builder(
            "heymimic.platform.queue.observations.last.success.epoch.seconds",
            lastSuccessEpochSeconds,
            AtomicLong::get)
        .register(registry);
  }
}
