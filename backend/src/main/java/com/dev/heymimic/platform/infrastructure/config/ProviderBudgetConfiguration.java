package com.dev.heymimic.platform.infrastructure.config;

import com.dev.heymimic.platform.application.publicapi.ProviderBudgetPolicy;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetRateCard;
import com.dev.heymimic.platform.application.publicapi.ProviderUsage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.OptionalLong;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Configuration
@EnableConfigurationProperties(ProviderBudgetConfiguration.Properties.class)
public class ProviderBudgetConfiguration {
  @Bean
  public ProviderBudgetPolicy providerBudgetPolicy(Properties properties) {
    return new ConfiguredProviderBudgetPolicy(properties);
  }

  @Validated
  @ConfigurationProperties("heymimic.provider-budget")
  public record Properties(
      boolean enabled,
      @PositiveOrZero long dailyLimitMicros,
      @NotBlank String rateCardVersion,
      Map<@NotBlank String, @PositiveOrZero Long> estimatedCostMicros,
      @PositiveOrZero long inputTokenMicrosPerMillion,
      @PositiveOrZero long outputTokenMicrosPerMillion,
      @PositiveOrZero long audioMicrosPerMinute,
      @PositiveOrZero long characterMicrosPerThousand) {
    public Properties {
      if (estimatedCostMicros == null) {
        estimatedCostMicros = Map.of();
      }
      if (enabled) {
        if (dailyLimitMicros <= 0) {
          throw new IllegalArgumentException(
              "heymimic.provider-budget.daily-limit-micros must be positive when enabled");
        }
        if (estimatedCostMicros.isEmpty()) {
          throw new IllegalArgumentException(
              "At least one provider budget estimate is required when enabled");
        }
        if (inputTokenMicrosPerMillion <= 0
            || outputTokenMicrosPerMillion <= 0
            || audioMicrosPerMinute <= 0
            || characterMicrosPerThousand <= 0) {
          throw new IllegalArgumentException(
              "All provider budget rates must be positive when enabled");
        }
      }
    }
  }

  private static final class ConfiguredProviderBudgetPolicy implements ProviderBudgetPolicy {
    private static final long MILLION = 1_000_000L;
    private static final long MINUTE_MILLIS = 60_000L;
    private static final long THOUSAND = 1_000L;

    private final Properties properties;

    private ConfiguredProviderBudgetPolicy(Properties properties) {
      this.properties = properties;
    }

    @Override
    public boolean enabled() {
      return properties.enabled();
    }

    @Override
    public long dailyLimitMicros() {
      return properties.dailyLimitMicros();
    }

    @Override
    public String rateCardVersion() {
      return properties.rateCardVersion();
    }

    @Override
    public OptionalLong estimatedCostMicros(String operation, String stage) {
      Long value = properties.estimatedCostMicros().get(operation + "." + stage);
      return value == null ? OptionalLong.empty() : OptionalLong.of(value);
    }

    @Override
    public boolean hasKnownUsage(ProviderUsage usage) {
      return usage != null
          && (usage.inputTokens() != null
              || usage.outputTokens() != null
              || usage.audioMilliseconds() != null
              || usage.characters() != null);
    }

    @Override
    public ProviderBudgetRateCard rateCard() {
      return new ProviderBudgetRateCard(
          properties.inputTokenMicrosPerMillion(),
          properties.outputTokenMicrosPerMillion(),
          properties.audioMicrosPerMinute(),
          properties.characterMicrosPerThousand());
    }

    @Override
    public boolean hasKnownUsage(String operation, String stage, ProviderUsage usage) {
      if (usage == null) return false;
      if ("STT".equalsIgnoreCase(stage)) return usage.audioMilliseconds() != null;
      if ("TTS".equalsIgnoreCase(stage)) return usage.characters() != null;
      if ("FEEDBACK".equalsIgnoreCase(stage) || "EXTRACTION".equalsIgnoreCase(stage)) {
        return usage.inputTokens() != null && usage.outputTokens() != null;
      }
      return hasKnownUsage(usage);
    }

    @Override
    public long actualCostMicros(ProviderUsage usage) {
      return actualCostMicros(usage, rateCard());
    }

    @Override
    public long actualCostMicros(ProviderUsage usage, ProviderBudgetRateCard card) {
      if (usage == null) return 0;
      return saturatingAdd(
          saturatingAdd(
              cost(usage.inputTokens(), card.inputTokenMicrosPerMillion(), MILLION),
              cost(usage.outputTokens(), card.outputTokenMicrosPerMillion(), MILLION)),
          saturatingAdd(
              cost(usage.audioMilliseconds(), card.audioMicrosPerMinute(), MINUTE_MILLIS),
              cost(usage.characters(), card.characterMicrosPerThousand(), THOUSAND)));
    }

    private long cost(Long units, long rate, long denominator) {
      if (units == null || units <= 0 || rate <= 0) return 0;
      BigDecimal value =
          BigDecimal.valueOf(units)
              .multiply(BigDecimal.valueOf(rate))
              .divide(BigDecimal.valueOf(denominator), 0, RoundingMode.CEILING);
      return value.compareTo(BigDecimal.valueOf(Long.MAX_VALUE)) >= 0
          ? Long.MAX_VALUE
          : value.longValue();
    }

    private long saturatingAdd(long left, long right) {
      if (Long.MAX_VALUE - left < right) return Long.MAX_VALUE;
      return left + right;
    }
  }
}
