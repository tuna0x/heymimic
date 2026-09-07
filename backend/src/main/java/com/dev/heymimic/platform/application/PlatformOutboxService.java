package com.dev.heymimic.platform.application;

import com.dev.heymimic.platform.application.port.OutboxStore;
import com.dev.heymimic.platform.application.publicapi.EventConsumer;
import com.dev.heymimic.platform.application.publicapi.EventDeliveryQueue;
import com.dev.heymimic.platform.application.publicapi.OutboxPublisher;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformOutboxService implements OutboxPublisher, EventDeliveryQueue {
  private final OutboxStore store;
  private final List<EventConsumer> consumers;
  private final Clock clock;

  public PlatformOutboxService(
      OutboxStore store, Collection<EventConsumer> consumers, Clock clock) {
    this.store = store;
    this.consumers = List.copyOf(consumers);
    this.clock = clock;
  }

  @Override
  @Transactional
  public UUID publish(PublishEvent event) {
    UUID eventId = UUID.randomUUID();
    List<String> consumerNames =
        consumers.stream()
            .filter(consumer -> consumer.eventType().equals(event.eventType()))
            .map(EventConsumer::consumerName)
            .distinct()
            .toList();
    store.append(eventId, event, consumerNames, clock.instant());
    return eventId;
  }

  @Override
  @Transactional
  public Optional<PublishedEvent> claimNext(String workerId, Duration lease) {
    validateLease(workerId, lease);
    return store.claimNext(workerId, clock.instant(), lease);
  }

  @Override
  @Transactional
  public boolean succeed(UUID deliveryId, String workerId, long generation) {
    return finish(deliveryId, workerId, generation, DeliveryStatus.SUCCEEDED, null, null);
  }

  @Override
  @Transactional
  public boolean retry(
      UUID deliveryId, String workerId, long generation, String errorCode, Instant nextAttemptAt) {
    if (nextAttemptAt == null || nextAttemptAt.isBefore(clock.instant())) {
      throw new IllegalArgumentException("nextAttemptAt must not be in the past");
    }
    return finish(
        deliveryId,
        workerId,
        generation,
        DeliveryStatus.FAILED_RETRYABLE,
        errorCode,
        nextAttemptAt);
  }

  @Override
  @Transactional
  public boolean failFinal(UUID deliveryId, String workerId, long generation, String errorCode) {
    return finish(deliveryId, workerId, generation, DeliveryStatus.FAILED_FINAL, errorCode, null);
  }

  private boolean finish(
      UUID id, String worker, long generation, DeliveryStatus status, String error, Instant next) {
    return store.finish(id, worker, generation, status, error, next, clock.instant());
  }

  private void validateLease(String workerId, Duration lease) {
    if (workerId == null || workerId.isBlank())
      throw new IllegalArgumentException("workerId is required");
    if (lease == null || lease.isNegative() || lease.isZero())
      throw new IllegalArgumentException("lease must be positive");
  }
}
