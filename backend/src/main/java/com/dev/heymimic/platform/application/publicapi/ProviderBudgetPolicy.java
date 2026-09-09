package com.dev.heymimic.platform.application.publicapi;

import java.util.OptionalLong;

public interface ProviderBudgetPolicy {
  boolean enabled();

  long dailyLimitMicros();

  String rateCardVersion();

  ProviderBudgetRateCard rateCard();

  default long actualCostMicros(ProviderUsage usage, ProviderBudgetRateCard rateCard) {
    return actualCostMicros(usage);
  }

  OptionalLong estimatedCostMicros(String operation, String stage);

  boolean hasKnownUsage(ProviderUsage usage);

  default boolean hasKnownUsage(String operation, String stage, ProviderUsage usage) {
    return hasKnownUsage(usage);
  }

  long actualCostMicros(ProviderUsage usage);
}
