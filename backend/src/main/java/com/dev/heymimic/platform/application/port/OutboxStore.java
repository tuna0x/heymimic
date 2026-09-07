package com.dev.heymimic.platform.application.port;

import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface OutboxStore {
  void append(
      UUID eventId, PublishEvent event, Collection<String> consumerNames, Instant createdAt);

  Optional<PublishedEvent> claimNext(String workerId, Instant now, Duration lease);

  boolean finish(
      UUID deliveryId,
      String workerId,
      long generation,
      DeliveryStatus status,
      String errorCode,
      Instant nextAttemptAt,
      Instant now);
}
