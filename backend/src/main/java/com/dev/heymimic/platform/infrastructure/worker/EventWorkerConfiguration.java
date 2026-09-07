package com.dev.heymimic.platform.infrastructure.worker;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(EventWorkerConfiguration.Properties.class)
public class EventWorkerConfiguration {
  @ConfigurationProperties("heymimic.events")
  public record Properties(
      boolean enabled,
      String workerId,
      int batchSize,
      Duration lease,
      Duration pollInterval,
      int maxAttempts) {}
}
