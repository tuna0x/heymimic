package com.dev.heymimic.platform.infrastructure.messaging;

import java.util.ArrayList;
import java.util.List;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
@ConditionalOnProperty(prefix = "heymimic.messaging", name = "transport", havingValue = "rabbitmq")
public class RabbitTransportConfiguration {
  public static final String EXCHANGE = "heymimic.dispatch.v1";
  public static final String DEAD_EXCHANGE = "heymimic.dead.v1";
  public static final List<String> ROUTES =
      List.of(
          "jobs.email",
          "jobs.speaking",
          "jobs.context",
          "jobs.planning",
          "jobs.maintenance",
          "events.projections");

  @Bean
  Declarables dispatchTopology() {
    List<Declarable> declarations = new ArrayList<>();
    DirectExchange exchange = new DirectExchange(EXCHANGE, true, false);
    DirectExchange dead = new DirectExchange(DEAD_EXCHANGE, true, false);
    declarations.add(exchange);
    declarations.add(dead);
    for (String route : ROUTES) {
      Queue queue =
          QueueBuilder.durable("heymimic." + route + ".v1")
              .quorum()
              .withArgument("x-delivery-limit", 5)
              .withArgument("x-max-length", 100000)
              .withArgument("x-overflow", "reject-publish")
              .withArgument("x-dead-letter-strategy", "at-least-once")
              .deadLetterExchange(DEAD_EXCHANGE)
              .deadLetterRoutingKey(route)
              .build();
      Queue dlq = QueueBuilder.durable("heymimic." + route + ".dead.v1").quorum().build();
      declarations.add(queue);
      declarations.add(dlq);
      declarations.add(BindingBuilder.bind(queue).to(exchange).with(route));
      declarations.add(BindingBuilder.bind(dlq).to(dead).with(route));
    }
    return new Declarables(declarations);
  }

  @Bean
  SimpleRabbitListenerContainerFactory dispatchListenerFactory(ConnectionFactory connections) {
    var factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connections);
    factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
    factory.setPrefetchCount(1);
    factory.setDefaultRequeueRejected(false);
    factory.setMissingQueuesFatal(false);
    factory.setContainerCustomizer(container -> container.setShutdownTimeout(150000L));
    return factory;
  }
}
