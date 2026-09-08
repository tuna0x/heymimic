package com.dev.heymimic.progress.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.progress.application.port.ActivityLedgerEntry;
import com.dev.heymimic.progress.application.port.ActivityLedgerStore;
import com.dev.heymimic.progress.application.port.DailyActivityStore;
import com.dev.heymimic.progress.application.publicapi.ProgressProjectionMaintenance;
import com.dev.heymimic.progress.domain.ProgressSourceType;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
class ProgressActivityLedgerIT {
  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
  }

  @Test
  void deduplicatesByEventAndLogicalSource(
      @Autowired ActivityLedgerStore ledger,
      @Autowired DailyActivityStore dailyActivities,
      @Autowired ProgressProjectionMaintenance maintenance,
      @Autowired JdbcTemplate jdbc) {
    UUID userId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    Instant occurredAt = Instant.parse("2026-09-08T17:30:00Z");
    jdbc.update(
        """
        insert into identity_users
          (id, email_normalized, password_hash, status, auth_version, created_at, updated_at)
        values (?, ?, 'hash', 'ACTIVE', 0, ?, ?)
        """,
        userId,
        userId + "@example.com",
        Timestamp.from(occurredAt),
        Timestamp.from(occurredAt));
    var entry =
        new ActivityLedgerEntry(
            UUID.randomUUID(),
            userId,
            ProgressSourceType.VOCABULARY_REVIEW,
            sessionId,
            LocalDate.parse("2026-09-09"),
            "Asia/Bangkok",
            60,
            "simple-v1",
            occurredAt);

    assertThat(ledger.append(entry)).isTrue();
    dailyActivities.add(
        entry.userId(),
        entry.activityDate(),
        entry.sourceType(),
        entry.durationSeconds(),
        entry.timezoneSnapshot(),
        entry.occurredAt());
    assertThat(ledger.append(entry)).isFalse();
    assertThat(
            ledger.append(
                new ActivityLedgerEntry(
                    UUID.randomUUID(),
                    userId,
                    entry.sourceType(),
                    sessionId,
                    entry.activityDate(),
                    entry.timezoneSnapshot(),
                    entry.durationSeconds(),
                    entry.ruleVersion(),
                    entry.occurredAt())))
        .isFalse();
    assertThat(
            jdbc.queryForObject(
                "select count(*) from progress_activity_ledger where user_id = ?",
                Integer.class,
                userId))
        .isEqualTo(1);
    assertThat(
            jdbc.queryForObject(
                """
                select vocab_seconds
                from progress_daily_activities
                where user_id = ? and activity_date = ?
                """,
                Integer.class,
                userId,
                entry.activityDate()))
        .isEqualTo(60);

    var rebuilt = maintenance.rebuildDaily("daily-v2");
    assertThat(rebuilt.sourceRows()).isEqualTo(1);
    assertThat(rebuilt.sourceSeconds()).isEqualTo(60);
    assertThat(rebuilt.projectedDays()).isEqualTo(1);
    assertThat(
            jdbc.queryForObject(
                "select active_generation_id from progress_projection_state where id = 1",
                UUID.class))
        .isEqualTo(rebuilt.generationId());
    assertThat(
            jdbc.queryForObject(
                """
                select vocab_seconds
                from progress_daily_activities
                where generation_id = ? and user_id = ? and activity_date = ?
                """,
                Integer.class,
                rebuilt.generationId(),
                userId,
                entry.activityDate()))
        .isEqualTo(60);
  }
}
