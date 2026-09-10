package com.dev.heymimic.platform.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.JobQueue;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "heymimic.jobs", name = "enabled", havingValue = "true")
public class PlatformJobWorker {
  private final TransportProperties transport;
  private final JobQueue queue;
  private final PlatformJobExecutor executor;
  private final JobWorkerConfiguration.Properties properties;

  public PlatformJobWorker(
      JobQueue queue,
      PlatformJobExecutor executor,
      JobWorkerConfiguration.Properties properties,
      TransportProperties transport) {
    this.transport = transport;
    this.queue = queue;
    this.executor = executor;
    this.properties = properties;
  }

  @Scheduled(fixedDelayString = "${heymimic.jobs.poll-interval:2s}")
  public void poll() {
    if (transport.rabbit()) return;
    for (int i = 0; i < properties.batchSize(); i++) {
      var claimed = queue.claimNext(properties.workerId(), properties.lease());
      if (claimed.isEmpty()) return;
      executor.execute(claimed.orElseThrow());
    }
  }
}
