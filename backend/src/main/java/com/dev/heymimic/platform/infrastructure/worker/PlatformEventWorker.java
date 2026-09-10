package com.dev.heymimic.platform.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.EventDeliveryQueue;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "heymimic.events", name = "enabled", havingValue = "true")
public class PlatformEventWorker {
  private final EventDeliveryQueue queue;
  private final PlatformEventExecutor executor;
  private final EventWorkerConfiguration.Properties properties;
  private final TransportProperties transport;

  public PlatformEventWorker(
      EventDeliveryQueue queue,
      PlatformEventExecutor executor,
      EventWorkerConfiguration.Properties properties,
      TransportProperties transport) {
    this.queue = queue;
    this.executor = executor;
    this.properties = properties;
    this.transport = transport;
  }

  @Scheduled(fixedDelayString = "${heymimic.events.poll-interval:2s}")
  public void poll() {
    if (transport.rabbit()) return;
    for (int i = 0; i < properties.batchSize(); i++) {
      var event = queue.claimNext(properties.workerId(), properties.lease());
      if (event.isEmpty()) return;
      executor.execute(event.orElseThrow());
    }
  }
}
