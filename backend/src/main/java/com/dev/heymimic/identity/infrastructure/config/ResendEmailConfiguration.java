package com.dev.heymimic.identity.infrastructure.config;

import com.dev.heymimic.identity.application.port.IdentityEmailSender;
import com.dev.heymimic.identity.infrastructure.email.ResendIdentityEmailSender;
import java.time.Duration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile({"prod", "staging"})
@ConditionalOnProperty(
    prefix = "heymimic.identity.email",
    name = "provider",
    havingValue = "resend")
@EnableConfigurationProperties(ResendEmailConfiguration.Properties.class)
public class ResendEmailConfiguration {
  @Bean
  IdentityEmailSender identityEmailSender(Properties properties) {
    return ResendIdentityEmailSender.create(properties);
  }

  @ConfigurationProperties("heymimic.identity.email")
  public record Properties(
      String provider,
      String apiKey,
      String fromAddress,
      String publicAppUrl,
      String apiBaseUrl,
      Duration requestTimeout) {
    public Properties {
      if (apiKey == null || apiKey.isBlank()) {
        throw new IllegalArgumentException(
            "heymimic.identity.email.api-key is required when Resend is enabled");
      }
      if (fromAddress == null || fromAddress.isBlank()) {
        throw new IllegalArgumentException(
            "heymimic.identity.email.from-address is required when Resend is enabled");
      }
      if (publicAppUrl == null || publicAppUrl.isBlank()) {
        throw new IllegalArgumentException(
            "heymimic.identity.email.public-app-url is required when Resend is enabled");
      }
      if (apiBaseUrl == null || apiBaseUrl.isBlank()) {
        apiBaseUrl = "https://api.resend.com";
      }
      if (requestTimeout == null || requestTimeout.isNegative() || requestTimeout.isZero()) {
        requestTimeout = Duration.ofSeconds(10);
      }
    }
  }
}
