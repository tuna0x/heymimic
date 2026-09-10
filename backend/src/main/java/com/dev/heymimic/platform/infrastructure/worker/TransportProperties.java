package com.dev.heymimic.platform.infrastructure.worker;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties("heymimic.messaging")
public record TransportProperties(@DefaultValue("postgres") String transport) {
  public TransportProperties {
    if (!"postgres".equals(transport) && !"rabbitmq".equals(transport))
      throw new IllegalArgumentException("Unsupported messaging transport");
  }

  public boolean rabbit() {
    return "rabbitmq".equals(transport);
  }
}
