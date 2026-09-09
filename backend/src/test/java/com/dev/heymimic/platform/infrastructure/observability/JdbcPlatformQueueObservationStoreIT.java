package com.dev.heymimic.platform.infrastructure.observability;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.infrastructure.persistence.JdbcJobStore;
import com.dev.heymimic.platform.infrastructure.persistence.JdbcOutboxStore;
import java.time.Duration;
import java.time.Instant;
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
class JdbcPlatformQueueObservationStoreIT {
  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  static JdbcJobStore jobs;
  static JdbcOutboxStore outbox;
  static JdbcPlatformQueueObservationStore observations;

  @BeforeAll
  static void migrate() {
    Flyway.configure()
        .dataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword())
        .load()
        .migrate();
    var dataSource =
        new DriverManagerDataSource(
            POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
    var jdbc = new JdbcTemplate(dataSource);
    jobs = new JdbcJobStore(jdbc);
    outbox = new JdbcOutboxStore(jdbc);
    observations = new JdbcPlatformQueueObservationStore(jdbc);
  }

  @Test
  void observesOnlyDueJobsIncludingExpiredLeases() {
    Instant started = Instant.parse("2026-09-08T10:00:00Z");
    jobs.enqueue(
        UUID.randomUUID(),
        new EnqueueJob(null, "DUE", UUID.randomUUID(), 1, "{}", started),
        started);
    jobs.enqueue(
        UUID.randomUUID(),
        new EnqueueJob(null, "FUTURE", UUID.randomUUID(), 1, "{}", started.plusSeconds(600)),
        started);
    jobs.enqueue(
        UUID.randomUUID(),
        new EnqueueJob(null, "EXPIRED_LEASE", UUID.randomUUID(), 1, "{}", started),
        started);
    jobs.claimNext("worker-a", started, Duration.ofSeconds(30)).orElseThrow();

    var snapshot = observations.observeJobs(started.plusSeconds(31));

    assertThat(snapshot.dueCount()).isEqualTo(2);
    assertThat(snapshot.oldestAgeSeconds()).isEqualTo(31);
  }

  @Test
  void measuresDeliveryLagFromOriginalEventTime() {
    Instant started = Instant.parse("2026-09-08T11:00:00Z");
    outbox.append(
        UUID.randomUUID(),
        new PublishEvent(null, "test.event", 1, UUID.randomUUID(), started, "{}"),
        List.of("consumer-a", "consumer-b"),
        started);
    outbox.claimNext("worker-a", started, Duration.ofSeconds(30)).orElseThrow();

    var snapshot = observations.observeDeliveries(started.plusSeconds(31));

    assertThat(snapshot.dueCount()).isEqualTo(2);
    assertThat(snapshot.oldestAgeSeconds()).isEqualTo(31);
  }
}
