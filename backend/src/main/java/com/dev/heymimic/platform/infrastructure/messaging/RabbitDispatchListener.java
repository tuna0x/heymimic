package com.dev.heymimic.platform.infrastructure.messaging;

import com.dev.heymimic.platform.infrastructure.persistence.JdbcBrokerDispatchStore;
import com.dev.heymimic.platform.infrastructure.worker.*;
import com.rabbitmq.client.Channel;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@ConditionalOnProperty(prefix = "heymimic.messaging", name = "transport", havingValue = "rabbitmq")
public class RabbitDispatchListener {
  private static final Logger log = LoggerFactory.getLogger(RabbitDispatchListener.class);
  private final JdbcBrokerDispatchStore store;
  private final PlatformJobExecutor jobs;
  private final PlatformEventExecutor events;
  private final JobWorkerConfiguration.Properties jobProperties;
  private final EventWorkerConfiguration.Properties eventProperties;
  private final ObjectMapper json;

  public RabbitDispatchListener(
      JdbcBrokerDispatchStore store,
      PlatformJobExecutor jobs,
      PlatformEventExecutor events,
      JobWorkerConfiguration.Properties jobProperties,
      EventWorkerConfiguration.Properties eventProperties,
      ObjectMapper json) {
    this.store = store;
    this.jobs = jobs;
    this.events = events;
    this.jobProperties = jobProperties;
    this.eventProperties = eventProperties;
    this.json = json;
  }

  @RabbitListener(
      queues = "heymimic.jobs.email.v1",
      containerFactory = "dispatchListenerFactory",
      concurrency = "${heymimic.messaging.concurrency.email:2}",
      autoStartup =
          "#{${heymimic.jobs.enabled:true} and ${heymimic.messaging.workloads.email:true}}")
  public void email(Message message, Channel channel) throws IOException {
    receive(message, channel, "jobs.email");
  }

  @RabbitListener(
      queues = "heymimic.jobs.speaking.v1",
      containerFactory = "dispatchListenerFactory",
      concurrency = "${heymimic.messaging.concurrency.speaking:2}",
      autoStartup =
          "#{${heymimic.jobs.enabled:true} and ${heymimic.messaging.workloads.speaking:true}}")
  public void speaking(Message message, Channel channel) throws IOException {
    receive(message, channel, "jobs.speaking");
  }

  @RabbitListener(
      queues = "heymimic.jobs.context.v1",
      containerFactory = "dispatchListenerFactory",
      concurrency = "${heymimic.messaging.concurrency.context:2}",
      autoStartup =
          "#{${heymimic.jobs.enabled:true} and ${heymimic.messaging.workloads.context:true}}")
  public void context(Message message, Channel channel) throws IOException {
    receive(message, channel, "jobs.context");
  }

  @RabbitListener(
      queues = "heymimic.jobs.planning.v1",
      containerFactory = "dispatchListenerFactory",
      concurrency = "${heymimic.messaging.concurrency.planning:1}",
      autoStartup =
          "#{${heymimic.jobs.enabled:true} and ${heymimic.messaging.workloads.planning:true}}")
  public void planning(Message message, Channel channel) throws IOException {
    receive(message, channel, "jobs.planning");
  }

  @RabbitListener(
      queues = "heymimic.jobs.maintenance.v1",
      containerFactory = "dispatchListenerFactory",
      concurrency = "${heymimic.messaging.concurrency.maintenance:1}",
      autoStartup =
          "#{${heymimic.jobs.enabled:true} and ${heymimic.messaging.workloads.maintenance:true}}")
  public void maintenance(Message message, Channel channel) throws IOException {
    receive(message, channel, "jobs.maintenance");
  }

  @RabbitListener(
      queues = "heymimic.events.projections.v1",
      containerFactory = "dispatchListenerFactory",
      concurrency = "${heymimic.messaging.concurrency.events:2}",
      autoStartup = "${heymimic.events.enabled:true}")
  public void projections(Message message, Channel channel) throws IOException {
    receive(message, channel, "events.projections");
  }

  public void receive(Message message, Channel channel, String route) throws IOException {
    long tag = message.getMessageProperties().getDeliveryTag();
    DispatchMessage envelope;
    try {
      if (message.getBody().length > 1024
          || !route.equals(message.getMessageProperties().getReceivedRoutingKey()))
        throw new IllegalArgumentException("Invalid dispatch route or size");
      envelope = json.readValue(message.getBody(), DispatchMessage.class);
      if (envelope == null) throw new IllegalArgumentException("Missing envelope");
    } catch (RuntimeException invalid) {
      channel.basicReject(tag, false);
      return;
    }
    try {
      if (route.startsWith("jobs."))
        store
            .claimJob(
                envelope.dispatchId(),
                envelope.generation(),
                route,
                jobProperties.workerId(),
                jobProperties.lease())
            .ifPresent(jobs::execute);
      else
        store
            .claimEvent(
                envelope.dispatchId(),
                envelope.generation(),
                route,
                eventProperties.workerId(),
                eventProperties.lease())
            .ifPresent(events::execute);
    } catch (RuntimeException failure) {
      // DB retry or expired-lease recovery remains authoritative, including a DB outage.
      log.warn(
          "Dispatch execution interrupted: dispatchId={}, error={}",
          envelope.dispatchId(),
          failure.getClass().getSimpleName());
      channel.basicReject(tag, false);
      return;
    }
    channel.basicAck(tag, false);
  }
}
