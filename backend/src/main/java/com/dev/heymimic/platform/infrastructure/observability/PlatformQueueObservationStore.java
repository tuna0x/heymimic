package com.dev.heymimic.platform.infrastructure.observability;

import java.time.Instant;

public interface PlatformQueueObservationStore {
  QueueObservation observeJobs(Instant now);

  QueueObservation observeDeliveries(Instant now);

  record QueueObservation(long dueCount, long oldestAgeSeconds) {
    public QueueObservation {
      if (dueCount < 0 || oldestAgeSeconds < 0) {
        throw new IllegalArgumentException("Queue observation values cannot be negative");
      }
    }
  }
}
