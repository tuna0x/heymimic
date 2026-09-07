package com.dev.heymimic.platform.application.publicapi;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface EventDeliveryQueue {
  Optional<PublishedEvent> claimNext(String workerId, Duration lease);

  boolean succeed(UUID deliveryId, String workerId, long generation);

  boolean retry(
      UUID deliveryId, String workerId, long generation, String errorCode, Instant nextAttemptAt);

  boolean failFinal(UUID deliveryId, String workerId, long generation, String errorCode);
}
