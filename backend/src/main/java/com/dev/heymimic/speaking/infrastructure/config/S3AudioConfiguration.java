package com.dev.heymimic.speaking.infrastructure.config;

import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.infrastructure.storage.S3AudioObjectStorage;
import java.net.URI;
import java.time.Duration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import tools.jackson.databind.ObjectMapper;

@Configuration
@Profile({"prod", "staging"})
@ConditionalOnProperty(
    prefix = "heymimic.speaking.storage",
    name = "provider",
    havingValue = "s3",
    matchIfMissing = true)
@EnableConfigurationProperties(S3AudioConfiguration.Properties.class)
public class S3AudioConfiguration {
  @Bean(destroyMethod = "close")
  S3Client s3Client(Properties properties) {
    var builder =
        S3Client.builder()
            .region(software.amazon.awssdk.regions.Region.of(properties.region()))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .serviceConfiguration(
                S3Configuration.builder().pathStyleAccessEnabled(properties.pathStyle()).build())
            .overrideConfiguration(
                ClientOverrideConfiguration.builder()
                    .apiCallTimeout(properties.requestTimeout())
                    .apiCallAttemptTimeout(properties.requestTimeout())
                    .build());
    if (properties.endpoint() != null && !properties.endpoint().isBlank()) {
      builder.endpointOverride(URI.create(properties.endpoint()));
    }
    return builder.build();
  }

  @Bean(destroyMethod = "close")
  S3Presigner s3Presigner(Properties properties) {
    var builder =
        S3Presigner.builder()
            .region(software.amazon.awssdk.regions.Region.of(properties.region()))
            .credentialsProvider(DefaultCredentialsProvider.create())
            .serviceConfiguration(
                S3Configuration.builder().pathStyleAccessEnabled(properties.pathStyle()).build());
    if (properties.endpoint() != null && !properties.endpoint().isBlank()) {
      builder.endpointOverride(URI.create(properties.endpoint()));
    }
    return builder.build();
  }

  @Bean
  AudioObjectStorage audioObjectStorage(
      S3Client client, S3Presigner presigner, Properties properties, ObjectMapper objectMapper) {
    return new S3AudioObjectStorage(client, presigner, properties, objectMapper);
  }

  @ConfigurationProperties("heymimic.speaking.storage")
  public record Properties(
      String provider,
      String bucket,
      String region,
      String endpoint,
      boolean pathStyle,
      Duration requestTimeout,
      Duration uploadTtl,
      Duration playbackTtl,
      long maxObjectBytes,
      String ffprobeCommand,
      Duration ffprobeTimeout) {
    public Properties {
      if (bucket == null || bucket.isBlank()) {
        throw new IllegalArgumentException(
            "heymimic.speaking.storage.bucket is required when S3 is enabled");
      }
      if (region == null || region.isBlank()) {
        throw new IllegalArgumentException(
            "heymimic.speaking.storage.region is required when S3 is enabled");
      }
      if (requestTimeout == null || requestTimeout.isNegative() || requestTimeout.isZero()) {
        requestTimeout = Duration.ofSeconds(15);
      }
      if (uploadTtl == null || uploadTtl.isNegative() || uploadTtl.isZero()) {
        uploadTtl = Duration.ofMinutes(10);
      }
      if (playbackTtl == null || playbackTtl.isNegative() || playbackTtl.isZero()) {
        playbackTtl = Duration.ofSeconds(60);
      }
      if (maxObjectBytes < 1 || maxObjectBytes > 20L * 1024 * 1024) {
        maxObjectBytes = 20L * 1024 * 1024;
      }
      if (ffprobeCommand == null || ffprobeCommand.isBlank()) {
        ffprobeCommand = "ffprobe";
      }
      if (ffprobeTimeout == null || ffprobeTimeout.isNegative() || ffprobeTimeout.isZero()) {
        ffprobeTimeout = Duration.ofSeconds(10);
      }
    }
  }
}
