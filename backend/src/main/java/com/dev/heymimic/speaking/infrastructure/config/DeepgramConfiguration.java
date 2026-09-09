package com.dev.heymimic.speaking.infrastructure.config;

import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionPort;
import com.dev.heymimic.speaking.infrastructure.provider.DeepgramTranscriptionAdapter;
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
@ConditionalOnProperty(
    prefix = "heymimic.speaking.transcription",
    name = "provider",
    havingValue = "deepgram",
    matchIfMissing = true)
@EnableConfigurationProperties(DeepgramConfiguration.Properties.class)
public class DeepgramConfiguration {
  @Bean
  SpeakingTranscriptionPort speakingTranscriptionPort(
      Properties properties, AudioObjectStorage storage, ObjectMapper objectMapper) {
    return DeepgramTranscriptionAdapter.create(properties, storage, objectMapper);
  }

  @ConfigurationProperties("heymimic.speaking.transcription")
  public record Properties(
      String provider, String apiKey, String model, String apiBaseUrl, Duration requestTimeout) {
    public Properties {
      if (apiKey == null || apiKey.isBlank()) {
        throw new IllegalArgumentException(
            "heymimic.speaking.transcription.api-key is required when Deepgram is enabled");
      }
      if (model == null || model.isBlank()) {
        model = "nova-3";
      }
      if (apiBaseUrl == null || apiBaseUrl.isBlank()) {
        apiBaseUrl = "https://api.deepgram.com";
      }
      if (requestTimeout == null || requestTimeout.isNegative() || requestTimeout.isZero()) {
        requestTimeout = Duration.ofSeconds(30);
      }
    }
  }
}
