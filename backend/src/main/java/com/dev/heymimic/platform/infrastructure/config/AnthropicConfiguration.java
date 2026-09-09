package com.dev.heymimic.platform.infrastructure.config;

import com.dev.heymimic.platform.infrastructure.ai.AnthropicMessageClient;
import java.time.Duration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import tools.jackson.databind.ObjectMapper;

@Configuration
@Profile({"prod", "staging"})
@ConditionalOnProperty(prefix = "heymimic.ai", name = "provider", havingValue = "anthropic")
@EnableConfigurationProperties(AnthropicConfiguration.Properties.class)
public class AnthropicConfiguration {
  @Bean
  AnthropicMessageClient anthropicMessageClient(Properties properties, ObjectMapper objectMapper) {
    return AnthropicMessageClient.create(properties, objectMapper);
  }

  @ConfigurationProperties("heymimic.ai")
  public record Properties(
      String provider,
      String apiKey,
      String model,
      String apiBaseUrl,
      Duration requestTimeout,
      int maxOutputTokens,
      String promptVersion,
      String rubricVersion) {
    public Properties {
      if (apiKey == null || apiKey.isBlank()) {
        throw new IllegalArgumentException(
            "heymimic.ai.api-key is required when Anthropic is enabled");
      }
      if (model == null || model.isBlank()) {
        throw new IllegalArgumentException(
            "heymimic.ai.model is required when Anthropic is enabled");
      }
      if (apiBaseUrl == null || apiBaseUrl.isBlank()) {
        apiBaseUrl = "https://api.anthropic.com";
      }
      if (requestTimeout == null || requestTimeout.isNegative() || requestTimeout.isZero()) {
        requestTimeout = Duration.ofSeconds(30);
      }
      if (maxOutputTokens < 64 || maxOutputTokens > 8192) {
        maxOutputTokens = 1200;
      }
      if (promptVersion == null || promptVersion.isBlank()) {
        promptVersion = "claude-speaking-feedback-v1";
      }
      if (rubricVersion == null || rubricVersion.isBlank()) {
        rubricVersion = "general-speaking-v1";
      }
    }
  }
}
