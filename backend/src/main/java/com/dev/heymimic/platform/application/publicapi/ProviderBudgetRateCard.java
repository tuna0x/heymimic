package com.dev.heymimic.platform.application.publicapi;

public record ProviderBudgetRateCard(
    long inputTokenMicrosPerMillion,
    long outputTokenMicrosPerMillion,
    long audioMicrosPerMinute,
    long characterMicrosPerThousand) {
  public ProviderBudgetRateCard {
    if (inputTokenMicrosPerMillion < 0
        || outputTokenMicrosPerMillion < 0
        || audioMicrosPerMinute < 0
        || characterMicrosPerThousand < 0) {
      throw new IllegalArgumentException("Rate card values cannot be negative");
    }
  }
}
