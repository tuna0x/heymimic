package com.dev.heymimic.platform.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.domain.JobStatus;
import java.time.Duration;
import java.time.Instant;
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
class JdbcJobStoreIT {
  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  static JdbcTemplate jdbc;
  static JdbcJobStore store;

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
    store = new JdbcJobStore(jdbc);
  }

  @Test
  void reclaimsExpiredLeaseAndRejectsStaleWorkerCommit() {
    Instant started = Instant.parse("2026-09-07T08:00:00Z");
    UUID resourceId = UUID.randomUUID();
    UUID jobId =
        store.enqueue(
            UUID.randomUUID(),
            new EnqueueJob(null, "TEST", resourceId, 1, "{\"value\":1}", started),
            started);

    var first = store.claimNext("worker-a", started, Duration.ofSeconds(30)).orElseThrow();
    assertThat(first.id()).isEqualTo(jobId);
    assertThat(store.claimNext("worker-b", started.plusSeconds(20), Duration.ofSeconds(30)))
        .isEmpty();

    var reclaimed =
        store.claimNext("worker-b", started.plusSeconds(31), Duration.ofSeconds(30)).orElseThrow();
    assertThat(reclaimed.leaseGeneration()).isGreaterThan(first.leaseGeneration());
    assertThat(
            store.finish(
                jobId,
                "worker-a",
                first.leaseGeneration(),
                JobStatus.SUCCEEDED,
                null,
                null,
                started.plusSeconds(32)))
        .isFalse();
    assertThat(
            store.finish(
                jobId,
                "worker-b",
                reclaimed.leaseGeneration(),
                JobStatus.SUCCEEDED,
                null,
                null,
                started.plusSeconds(32)))
        .isTrue();
    assertThat(
            jdbc.queryForObject(
                "select status from platform_jobs where id = ?", String.class, jobId))
        .isEqualTo("SUCCEEDED");
  }

  @Test
  void enqueueIsIdempotentForJobTypeAndResource() {
    Instant now = Instant.parse("2026-09-07T09:00:00Z");
    UUID resourceId = UUID.randomUUID();
    EnqueueJob command = new EnqueueJob(null, "IDEMPOTENT", resourceId, 1, "{}", now);
    UUID first = store.enqueue(UUID.randomUUID(), command, now);
    UUID second = store.enqueue(UUID.randomUUID(), command, now);
    assertThat(second).isEqualTo(first);
  }
}
