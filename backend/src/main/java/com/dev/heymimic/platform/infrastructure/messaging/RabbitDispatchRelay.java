package com.dev.heymimic.platform.infrastructure.messaging;

import com.dev.heymimic.platform.infrastructure.persistence.JdbcBrokerDispatchStore;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@ConditionalOnProperty(prefix = "heymimic.messaging", name = "transport", havingValue = "rabbitmq")
@org.springframework.boot.autoconfigure.condition.ConditionalOnExpression(
    "${heymimic.messaging.relay-enabled:true}")
public class RabbitDispatchRelay {
  private static final Logger log = LoggerFactory.getLogger(RabbitDispatchRelay.class);
  private final JdbcBrokerDispatchStore store;
  private final RabbitTemplate rabbit;
  private final ObjectMapper json;
  private final MeterRegistry metrics;

  public RabbitDispatchRelay(
      JdbcBrokerDispatchStore store,
      RabbitTemplate rabbit,
      ObjectMapper json,
      MeterRegistry metrics) {
    this.store = store;
    this.rabbit = rabbit;
    this.json = json;
    this.metrics = metrics;
    rabbit.setMandatory(true);
  }

  @Scheduled(fixedDelayString = "${heymimic.messaging.relay-interval:1s}")
  public void publish() {
    for (int i = 0; i < 50; i++) {
      var next = store.claimPublish();
      if (next.isEmpty()) return;
      var dispatch = next.orElseThrow();
      try {
        var properties = new MessageProperties();
        properties.setContentType("application/json");
        properties.setDeliveryMode(MessageDeliveryMode.PERSISTENT);
        properties.setMessageId(dispatch.id() + ":" + dispatch.generation());
        var message =
            new Message(
                json.writeValueAsBytes(
                    new DispatchMessage(1, dispatch.id(), dispatch.generation())),
                properties);
        var correlation = new CorrelationData(dispatch.token().toString());
        rabbit.send(
            RabbitTransportConfiguration.EXCHANGE, dispatch.routingKey(), message, correlation);
        var confirm = correlation.getFuture().get(10, TimeUnit.SECONDS);
        if (!confirm.isAck() || correlation.getReturned() != null)
          throw new IllegalStateException("Dispatch not routed and confirmed");
        store.published(dispatch);
        metrics.counter("heymimic.dispatch.publish", "outcome", "confirmed").increment();
      } catch (Exception failure) {
        if (failure instanceof InterruptedException) Thread.currentThread().interrupt();
        store.publishFailed(dispatch);
        metrics.counter("heymimic.dispatch.publish", "outcome", "retry").increment();
        log.warn(
            "Dispatch publish deferred: dispatchId={}, error={}",
            dispatch.id(),
            failure.getClass().getSimpleName());
        return;
      }
    }
  }

  @Scheduled(fixedDelayString = "${heymimic.messaging.recovery-interval:10s}")
  public void recover() {
    int recovered = store.recoverExpired();
    if (recovered > 0) metrics.counter("heymimic.dispatch.recovered").increment(recovered);
  }
}
