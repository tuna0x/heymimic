package com.dev.heymimic.platform.infrastructure.worker;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@EnableConfigurationProperties({JobWorkerConfiguration.Properties.class, TransportProperties.class})
public class JobWorkerConfiguration {
  @ConfigurationProperties("heymimic.jobs")
  public record Properties(
      boolean enabled,
      String workerId,
      int batchSize,
      Duration lease,
      Duration pollInterval,
      int maxAttempts) {
    public Properties {
      if (workerId == null || workerId.isBlank())
        workerId = "worker-" + java.util.UUID.randomUUID();
      if (batchSize < 1 || maxAttempts < 1 || lease == null || lease.isNegative() || lease.isZero())
        throw new IllegalArgumentException("Invalid worker limits");
    }
  }
}
