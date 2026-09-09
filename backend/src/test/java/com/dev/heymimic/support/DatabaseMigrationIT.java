package com.dev.heymimic.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.DriverManager;
import java.util.HashSet;
import java.util.Set;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class DatabaseMigrationIT {
  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  @Test
  void migratesAnEmptyPostgresDatabase() throws Exception {
    Flyway.configure()
        .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
        .load()
        .migrate();

    Set<String> tables = new HashSet<>();
    try (var connection =
            DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        var result =
            connection.getMetaData().getTables(null, "public", "%", new String[] {"TABLE"})) {
      while (result.next()) {
        tables.add(result.getString("TABLE_NAME"));
      }
    }

    assertThat(tables)
        .contains(
            "platform_jobs",
            "platform_outbox_events",
            "platform_event_deliveries",
            "platform_idempotency_records",
            "platform_quota_reservations",
            "platform_rate_limit_counters",
            "identity_users",
            "identity_session_families",
            "identity_refresh_tokens",
            "identity_email_tokens",
            "learner_profiles",
            "progress_activity_ledger",
            "progress_daily_activities",
            "progress_mistake_patterns",
            "progress_mistake_occurrences",
            "progress_projection_generations",
            "progress_projection_state",
            "speaking_topics",
            "speaking_sessions",
            "speaking_attempts",
            "speaking_evaluations",
            "speaking_feedback_items",
            "study_sessions",
            "study_steps");
  }
}
