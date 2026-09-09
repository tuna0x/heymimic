package com.dev.heymimic.shared.observability;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTaskMetrics {
  private final MeterRegistry registry;
  private final Clock clock;
  private final ConcurrentMap<String, TaskState> states = new ConcurrentHashMap<>();

  public ScheduledTaskMetrics(MeterRegistry registry, Clock clock) {
    this.registry = registry;
    this.clock = clock;
  }

  public void recordSuccess(String task) {
    TaskState state = state(task);
    state.successfulRuns.increment();
    state.lastSuccessEpochSeconds.set(clock.instant().getEpochSecond());
  }

  public void recordFailure(String task) {
    state(task).failedRuns.increment();
  }

  public void recordItems(String task, String outcome, long count) {
    if (count <= 0) {
      return;
    }
    registry
        .counter("heymimic.maintenance.items", "task", task, "outcome", outcome)
        .increment(count);
  }

  private TaskState state(String task) {
    return states.computeIfAbsent(task, this::register);
  }

  private TaskState register(String task) {
    AtomicLong lastSuccessEpochSeconds = new AtomicLong();
    Gauge.builder(
            "heymimic.maintenance.last.success.epoch.seconds",
            lastSuccessEpochSeconds,
            AtomicLong::get)
        .tag("task", task)
        .register(registry);
    return new TaskState(
        registry.counter("heymimic.maintenance.runs", "task", task, "outcome", "success"),
        registry.counter("heymimic.maintenance.runs", "task", task, "outcome", "failure"),
        lastSuccessEpochSeconds);
  }

  private record TaskState(
      Counter successfulRuns, Counter failedRuns, AtomicLong lastSuccessEpochSeconds) {}
}
