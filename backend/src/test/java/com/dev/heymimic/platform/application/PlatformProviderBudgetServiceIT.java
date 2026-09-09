package com.dev.heymimic.platform.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dev.heymimic.platform.application.publicapi.ProviderBudgetManager;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetPolicy;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetReservationCommand;
import com.dev.heymimic.platform.application.publicapi.ProviderCallStatus;
import com.dev.heymimic.platform.application.publicapi.ProviderUsage;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageReceipt;
import com.dev.heymimic.platform.infrastructure.config.ProviderBudgetConfiguration;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class PlatformProviderBudgetServiceIT {
  private static final Instant NOW = Instant.parse("2026-09-09T08:00:00Z");

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  static JdbcTemplate jdbc;
  static ProviderBudgetPolicy policy;
  static ProviderBudgetManager budget;

  @BeforeAll
  static void migrate() {
    Flyway.configure()
        .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
        .load()
        .migrate();
    jdbc =
        new JdbcTemplate(
            new DriverManagerDataSource(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword()));
    policy =
        new ProviderBudgetConfiguration()
            .providerBudgetPolicy(
                new ProviderBudgetConfiguration.Properties(
                    true,
                    100,
                    "test-v1",
                    Map.of("SPEAKING_EVALUATION.FEEDBACK", 60L),
                    500_000,
                    2_000_000,
                    60_000,
                    400));
    budget = new PlatformProviderBudgetService(jdbc, policy, Clock.fixed(NOW, ZoneOffset.UTC));
  }

  @BeforeEach
  void clean() {
    jdbc.update("delete from platform_provider_budget_reservations");
  }

  @Test
  void reservesIdempotentlyAndReconcilesKnownUsage() {
    UUID operationId = UUID.randomUUID();
    UUID resourceId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    var command =
        new ProviderBudgetReservationCommand(
            operationId, resourceId, userId, "SPEAKING_EVALUATION", "FEEDBACK", 1);

    budget.reserve(command);
    budget.reserve(command);

    assertThat(count(operationId)).isOne();

    budget.reconcile(
        new ProviderUsageReceipt(
            operationId,
            resourceId,
            userId,
            "SPEAKING_EVALUATION",
            "FEEDBACK",
            1,
            "anthropic",
            "test-model",
            ProviderCallStatus.SUCCEEDED,
            new ProviderUsage("request-1", 100L, 50L, null, null),
            null));

    assertThat(status(operationId)).isEqualTo("RECONCILED");
    assertThat(actualCost(operationId)).isEqualTo(150L);

    var next =
        new ProviderBudgetReservationCommand(
            UUID.randomUUID(), UUID.randomUUID(), userId, "SPEAKING_EVALUATION", "FEEDBACK", 1);
    assertThatThrownBy(() -> budget.reserve(next))
        .isInstanceOf(ApiException.class)
        .satisfies(
            error ->
                assertThat(((ApiException) error).code()).isEqualTo("PROVIDER_BUDGET_EXCEEDED"));
  }

  @Test
  void keepsUnknownReservationAndRejectsTheNextReservationAtTheCap() {
    UUID operationId = UUID.randomUUID();
    UUID resourceId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    var first =
        new ProviderBudgetReservationCommand(
            operationId, resourceId, userId, "SPEAKING_EVALUATION", "FEEDBACK", 1);
    budget.reserve(first);
    budget.reconcile(
        ProviderUsageReceipt.unknownFailure(
            operationId,
            resourceId,
            userId,
            "SPEAKING_EVALUATION",
            "FEEDBACK",
            1,
            "FEEDBACK_TIMEOUT"));

    assertThat(status(operationId)).isEqualTo("UNKNOWN");
    assertThat(actualCost(operationId)).isNull();

    var second =
        new ProviderBudgetReservationCommand(
            UUID.randomUUID(), UUID.randomUUID(), userId, "SPEAKING_EVALUATION", "FEEDBACK", 1);
    assertThatThrownBy(() -> budget.reserve(second))
        .isInstanceOf(ApiException.class)
        .satisfies(
            error ->
                assertThat(((ApiException) error).code()).isEqualTo("PROVIDER_BUDGET_EXCEEDED"));
  }

  private int count(UUID operationId) {
    return jdbc.queryForObject(
        "select count(*) from platform_provider_budget_reservations where operation_id = ?",
        Integer.class,
        operationId);
  }

  private String status(UUID operationId) {
    return jdbc.queryForObject(
        "select status from platform_provider_budget_reservations where operation_id = ?",
        String.class,
        operationId);
  }

  private Long actualCost(UUID operationId) {
    return jdbc.queryForObject(
        "select actual_cost_micros from platform_provider_budget_reservations where operation_id = ?",
        Long.class,
        operationId);
  }
}
