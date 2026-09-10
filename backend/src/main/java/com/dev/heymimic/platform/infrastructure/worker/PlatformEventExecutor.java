package com.dev.heymimic.platform.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.AccountWorkGuard;
import com.dev.heymimic.platform.application.publicapi.EventConsumer;
import com.dev.heymimic.platform.application.publicapi.EventDeliveryQueue;
import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import com.dev.heymimic.platform.infrastructure.observability.PlatformWorkerMetrics;
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
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class PlatformEventExecutor {
  private static final Logger log = LoggerFactory.getLogger(PlatformEventExecutor.class);
  private static final Duration[] RETRY_DELAYS = {
    Duration.ofSeconds(10), Duration.ofSeconds(30), Duration.ofMinutes(2), Duration.ofMinutes(10)
  };

  private final EventDeliveryQueue queue;
  private final Map<String, EventConsumer> consumers;
  private final AccountWorkGuard accountWorkGuard;
  private final EventWorkerConfiguration.Properties properties;
  private final Clock clock;
  private final TransactionTemplate transactions;
  private final PlatformWorkerMetrics metrics;

  public PlatformEventExecutor(
      EventDeliveryQueue queue,
      Collection<EventConsumer> consumers,
      ObjectProvider<AccountWorkGuard> accountWorkGuard,
      EventWorkerConfiguration.Properties properties,
      Clock clock,
      TransactionTemplate transactions,
      PlatformWorkerMetrics metrics) {
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
    this.transactions = transactions;
    this.metrics = metrics;
  }

  public void execute(PublishedEvent event) {
    long startedAt = System.nanoTime();
    String outcome = "worker_error";
    try {
      outcome = process(event);
    } finally {
      metrics.recordEvent(event.consumerName(), outcome, System.nanoTime() - startedAt);
    }
  }

  private String process(PublishedEvent event) {
    EventConsumer consumer = consumers.get(event.consumerName());
    if (consumer == null) {
      return finishFinal(event, "UNKNOWN_CONSUMER") ? "unknown_consumer" : "lease_rejected";
    }
    if (event.ownerUserId() != null && !accountWorkGuard.canStartWork(event.ownerUserId())) {
      return finishFinal(event, "ACCOUNT_INACTIVE") ? "owner_inactive" : "lease_rejected";
    }

    if (event.attempts() > properties.maxAttempts()) {
      return finishFinal(event, "RETRY_BUDGET_EXHAUSTED") ? "failed_final" : "lease_rejected";
    }
    try {
      transactions.executeWithoutResult(ignored -> consumeAndAcknowledge(consumer, event));
      return "succeeded";
    } catch (EventLeaseLostException exception) {
      log.warn("Event completion rejected by lease fence: deliveryId={}", event.deliveryId());
      return "lease_rejected";
    } catch (RetryableEventException exception) {
      return retryOrFail(event, exception.errorCode(), exception);
    } catch (CheckedEventConsumerException exception) {
      return retryOrFail(event, "UNEXPECTED_ERROR", exception.checkedCause());
    } catch (Exception exception) {
      return retryOrFail(event, "UNEXPECTED_ERROR", exception);
    }
  }

  private void consumeAndAcknowledge(EventConsumer consumer, PublishedEvent event) {
    try {
      consumer.consume(event);
    } catch (RuntimeException exception) {
      throw exception;
    } catch (Exception exception) {
      throw new CheckedEventConsumerException(exception);
    }
    if (!queue.succeed(event.deliveryId(), properties.workerId(), event.leaseGeneration())) {
      throw new EventLeaseLostException();
    }
  }

  private String retryOrFail(PublishedEvent event, String errorCode, Exception exception) {
    if (event.attempts() >= properties.maxAttempts()) {
      boolean saved = finishFinal(event, errorCode);
      log.error(
          "Event delivery exhausted retry budget: deliveryId={}, eventType={}",
          event.deliveryId(),
          event.eventType(),
          exception);
      return saved ? "failed_final" : "lease_rejected";
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
    return saved ? "retry_scheduled" : "lease_rejected";
  }

  private boolean finishFinal(PublishedEvent event, String errorCode) {
    boolean saved =
        queue.failFinal(
            event.deliveryId(), properties.workerId(), event.leaseGeneration(), errorCode);
    if (!saved)
      log.warn("Final event failure rejected by lease fence: deliveryId={}", event.deliveryId());
    return saved;
  }

  private static final class EventLeaseLostException extends RuntimeException {}

  private static final class CheckedEventConsumerException extends RuntimeException {
    private CheckedEventConsumerException(Exception cause) {
      super(cause);
    }

    private Exception checkedCause() {
      return (Exception) getCause();
    }
  }
}
