package com.dev.heymimic.platform.infrastructure.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.platform.application.publicapi.ProviderBudgetPolicy;
import com.dev.heymimic.platform.application.publicapi.ProviderUsage;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ProviderBudgetConfigurationTest {
  @Test
  void calculatesCostFromKnownUsageUsingTheConfiguredRateCard() {
    ProviderBudgetPolicy policy =
        new ProviderBudgetConfiguration()
            .providerBudgetPolicy(
                new ProviderBudgetConfiguration.Properties(
                    true,
                    100_000,
                    "test-v1",
                    Map.of("SPEAKING_EVALUATION.FEEDBACK", 1_000L),
                    500_000,
                    2_000_000,
                    60_000,
                    400));

    assertThat(policy.estimatedCostMicros("SPEAKING_EVALUATION", "FEEDBACK")).hasValue(1_000);
    assertThat(policy.actualCostMicros(new ProviderUsage("request-1", 100L, 50L, 60_000L, 2_500L)))
        .isEqualTo(61_150L);
  }

  @Test
  void treatsMissingUsageMetricsAsUnknown() {
    ProviderBudgetPolicy policy =
        new ProviderBudgetConfiguration()
            .providerBudgetPolicy(
                new ProviderBudgetConfiguration.Properties(
                    true,
                    100_000,
                    "test-v1",
                    Map.of("SPEAKING_EVALUATION.FEEDBACK", 1L),
                    1,
                    1,
                    1,
                    1));

    assertThat(policy.hasKnownUsage(ProviderUsage.unknown())).isFalse();
    assertThat(policy.hasKnownUsage(new ProviderUsage("request-1", 1L, null, null, null))).isTrue();
    assertThat(
            policy.hasKnownUsage(
                "SPEAKING_EVALUATION",
                "FEEDBACK",
                new ProviderUsage("request-1", 1L, null, null, null)))
        .isFalse();
    assertThat(
            policy.hasKnownUsage(
                "SPEAKING_EVALUATION",
                "FEEDBACK",
                new ProviderUsage("request-1", 1L, 1L, null, null)))
        .isTrue();
    assertThat(policy.estimatedCostMicros("MISSING", "STAGE")).isEmpty();
  }
}
