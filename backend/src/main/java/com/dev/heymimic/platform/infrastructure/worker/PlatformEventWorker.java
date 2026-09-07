package com.dev.heymimic.platform.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.AccountWorkGuard;
import com.dev.heymimic.platform.application.publicapi.EventConsumer;
import com.dev.heymimic.platform.application.publicapi.EventDeliveryQueue;
import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "heymimic.events", name = "enabled", havingValue = "true")
public class PlatformEventWorker {
  private static final Logger log = LoggerFactory.getLogger(PlatformEventWorker.class);
  private static final Duration[] RETRY_DELAYS = {
    Duration.ofSeconds(10), Duration.ofSeconds(30), Duration.ofMinutes(2), Duration.ofMinutes(10)
  };

  private final EventDeliveryQueue queue;
  private final Map<String, EventConsumer> consumers;
  private final AccountWorkGuard accountWorkGuard;
  private final EventWorkerConfiguration.Properties properties;
  private final Clock clock;

  public PlatformEventWorker(
      EventDeliveryQueue queue,
      Collection<EventConsumer> consumers,
      ObjectProvider<AccountWorkGuard> accountWorkGuard,
      EventWorkerConfiguration.Properties properties,
      Clock clock) {
    this.queue = queue;
    this.consumers =
        consumers.stream()
            .collect(
                Collectors.toUnmodifiableMap(
                    EventConsumer::consumerName,
                    Function.identity(),
                    (first, duplicate) -> {
                      throw new IllegalStateException(
                          "Multiple event consumers named " + first.consumerName());
                    }));
    this.accountWorkGuard = accountWorkGuard.getIfAvailable(() -> ownerUserId -> true);
    this.properties = properties;
    this.clock = clock;
  }

  @Scheduled(fixedDelayString = "${heymimic.events.poll-interval:2s}")
  public void poll() {
    for (int index = 0; index < properties.batchSize(); index++) {
      var claimed = queue.claimNext(properties.workerId(), properties.lease());
      if (claimed.isEmpty()) return;
      execute(claimed.orElseThrow());
    }
  }

  void execute(PublishedEvent event) {
    EventConsumer consumer = consumers.get(event.consumerName());
    if (consumer == null) {
      finishFinal(event, "UNKNOWN_CONSUMER");
      return;
    }
    if (event.ownerUserId() != null && !accountWorkGuard.canStartWork(event.ownerUserId())) {
      finishFinal(event, "ACCOUNT_INACTIVE");
      return;
    }

    try {
      consumer.consume(event);
      boolean saved =
          queue.succeed(event.deliveryId(), properties.workerId(), event.leaseGeneration());
      if (!saved)
        log.warn("Event completion rejected by lease fence: deliveryId={}", event.deliveryId());
    } catch (RetryableEventException exception) {
      retryOrFail(event, exception.errorCode(), exception);
    } catch (Exception exception) {
      retryOrFail(event, "UNEXPECTED_ERROR", exception);
    }
  }

  private void retryOrFail(PublishedEvent event, String errorCode, Exception exception) {
    if (event.attempts() >= properties.maxAttempts()) {
      finishFinal(event, errorCode);
      log.error(
          "Event delivery exhausted retry budget: deliveryId={}, eventType={}",
          event.deliveryId(),
          event.eventType(),
          exception);
      return;
    }
    Duration delay = RETRY_DELAYS[Math.min(event.attempts() - 1, RETRY_DELAYS.length - 1)];
    Instant nextAttemptAt = clock.instant().plus(delay);
    boolean saved =
        queue.retry(
            event.deliveryId(),
            properties.workerId(),
            event.leaseGeneration(),
            errorCode,
            nextAttemptAt);
    if (!saved) log.warn("Event retry rejected by lease fence: deliveryId={}", event.deliveryId());
  }

  private void finishFinal(PublishedEvent event, String errorCode) {
    boolean saved =
        queue.failFinal(
            event.deliveryId(), properties.workerId(), event.leaseGeneration(), errorCode);
    if (!saved)
      log.warn("Final event failure rejected by lease fence: deliveryId={}", event.deliveryId());
  }
}
