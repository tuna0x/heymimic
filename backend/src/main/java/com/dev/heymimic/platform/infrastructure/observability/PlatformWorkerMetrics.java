package com.dev.heymimic.platform.infrastructure.observability;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.Timer;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Component;

@Component
public class PlatformWorkerMetrics {
  private static final String UNKNOWN_TAG = "unknown";

  private final MeterRegistry registry;

  public PlatformWorkerMetrics(MeterRegistry registry) {
    this.registry = registry;
  }

  public void recordJob(String type, String outcome, long durationNanos) {
    Tags tags = Tags.of("type", normalize(type), "outcome", normalize(outcome));
    registry.counter("heymimic.platform.jobs.processed", tags).increment();
    Timer.builder("heymimic.platform.jobs.duration")
        .tags(tags)
        .register(registry)
        .record(durationNanos, TimeUnit.NANOSECONDS);
  }

  public void recordJobHeartbeat(String type, String outcome) {
    registry
        .counter(
            "heymimic.platform.jobs.heartbeats",
            "type",
            normalize(type),
            "outcome",
            normalize(outcome))
        .increment();
  }

  public void recordEvent(String consumer, String outcome, long durationNanos) {
    Tags tags = Tags.of("consumer", normalize(consumer), "outcome", normalize(outcome));
    registry.counter("heymimic.platform.events.processed", tags).increment();
    Timer.builder("heymimic.platform.events.duration")
        .tags(tags)
        .register(registry)
        .record(durationNanos, TimeUnit.NANOSECONDS);
  }

  private String normalize(String value) {
    return value == null || value.isBlank() ? UNKNOWN_TAG : value;
  }
}
