package com.dev.heymimic.platform.infrastructure.config;

import com.dev.heymimic.platform.application.publicapi.QuotaLimits;
import com.dev.heymimic.platform.application.publicapi.QuotaPolicy;
import com.dev.heymimic.shared.error.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;

@Configuration
@EnableConfigurationProperties(QuotaConfiguration.Properties.class)
public class QuotaConfiguration {
  @Bean
  QuotaLimits quotaLimits(Properties properties) {
    return properties::dailyLimits;
  }

  @Bean
  QuotaPolicy quotaPolicy(Properties properties) {
    return quotaKind -> {
      Integer limit = properties.dailyLimits().get(quotaKind);
      if (limit == null) {
        throw new ApiException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "QUOTA_POLICY_MISSING",
            "No quota policy is configured for " + quotaKind);
      }
      return limit;
    };
  }

  @Validated
  @ConfigurationProperties("heymimic.quotas")
  public record Properties(@NotEmpty Map<@NotBlank String, @Valid @Positive Integer> dailyLimits) {}
}
