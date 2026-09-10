package com.dev.heymimic.study.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.study.application.port.DailyPlanRecord;
import com.dev.heymimic.study.application.port.DailyPlanStepRecord;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class JdbcDailyPlanStoreIT {
  private static final Instant NOW = Instant.parse("2026-09-09T08:00:00Z");

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  static JdbcTemplate jdbc;
  static JdbcDailyPlanStore store;

  @BeforeAll
  static void migrate() {
    Flyway.configure()
        .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
        .load()
        .migrate();
    var dataSource =
        new DriverManagerDataSource(
            POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    jdbc = new JdbcTemplate(dataSource);
    store = new JdbcDailyPlanStore(jdbc);
  }

  @Test
  void coalescesRefreshRequestsAndClaimsThemOnce() {
    UUID userId = user();
    LocalDate date = LocalDate.of(2026, 9, 9);
    jdbc.update(
        """
        insert into platform_user_context_versions
          (user_id, context_key, revision, ready_checkpoint_revision, updated_at)
        values (?, 'learning', 2, 2, ?)
        """,
        userId,
        Timestamp.from(NOW));
    DailyPlanRecord current = plan(userId, date, 1, "{}", "[]");
    store.insertPlan(current, current.steps(), NOW);

    var candidates = store.findRefreshCandidates(NOW, 10);
    assertThat(candidates)
        .singleElement()
        .satisfies(
            candidate -> {
              assertThat(candidate.userId()).isEqualTo(userId);
              assertThat(candidate.planId()).isEqualTo(current.id());
              assertThat(candidate.contextRevision()).isEqualTo(2);
            });

    UUID requestId = UUID.randomUUID();
    assertThat(store.createRefreshRequest(requestId, userId, 2, NOW, NOW.plusSeconds(3))).isTrue();
    assertThat(store.createRefreshRequest(UUID.randomUUID(), userId, 2, NOW, NOW.plusSeconds(3)))
        .isFalse();
    UUID jobId = UUID.randomUUID();
    assertThat(store.attachRefreshJob(requestId, jobId)).isTrue();
    assertThat(store.claimRefreshRequest(requestId, userId)).isTrue();
    assertThat(store.claimRefreshRequest(requestId, userId)).isFalse();
    store.finishRequest(requestId, "COMPLETED", null, NOW.plusSeconds(4));
    assertThat(
            jdbc.queryForObject(
                "select state from study_plan_requests where id = ?", String.class, requestId))
        .isEqualTo("COMPLETED");
  }

  @Test
  void replacesCurrentPlanAndKeepsImmutableVersionedSteps() {
    UUID userId = user();
    LocalDate date = LocalDate.of(2026, 9, 9);
    DailyPlanRecord first = plan(userId, date, 1, "{}", "[]");
    store.insertPlan(first, first.steps(), NOW);
    DailyPlanRecord second = plan(userId, date, 2, "{\"inputVersion\":2}", "[]");
    store.insertPlan(second, second.steps(), NOW.plusSeconds(1));

    var current = store.findCurrent(userId, date, "Asia/Bangkok").orElseThrow();
    assertThat(current.id()).isEqualTo(second.id());
    assertThat(current.planVersion()).isEqualTo(2);
    assertThat(current.steps())
        .singleElement()
        .satisfies(
            step -> {
              assertThat(step.targetRefsJson())
                  .isEqualTo("[\"00000000-0000-0000-0000-000000000222\"]");
              assertThat(step.position()).isZero();
            });
    assertThat(
            jdbc.queryForObject(
                "select count(*) from study_daily_plans where user_id = ? and is_current",
                Integer.class,
                userId))
        .isOne();
  }

  private DailyPlanRecord plan(
      UUID userId, LocalDate date, long version, String inputSnapshot, String reasons) {
    UUID planId = UUID.randomUUID();
    var step =
        new DailyPlanStepRecord(
            UUID.randomUUID(),
            0,
            "VOCABULARY",
            "OVERDUE_REVIEW",
            "[\"00000000-0000-0000-0000-000000000222\"]",
            180,
            "READY",
            null);
    return new DailyPlanRecord(
        planId,
        userId,
        date,
        "Asia/Bangkok",
        5,
        version,
        "READY",
        version,
        version,
        NOW.plusSeconds(900),
        "catalog-v1",
        "planner-v1",
        inputSnapshot,
        reasons,
        List.of(step));
  }

  private UUID user() {
    UUID userId = UUID.randomUUID();
    jdbc.update(
        """
        insert into identity_users
          (id, email_normalized, password_hash, status, created_at, updated_at)
        values (?, ?, 'test-hash', 'ACTIVE', ?, ?)
        """,
        userId,
        userId + "@example.com",
        Timestamp.from(NOW),
        Timestamp.from(NOW));
    return userId;
  }
}
