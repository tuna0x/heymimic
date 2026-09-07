package com.dev.heymimic.platform.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.domain.DeliveryStatus;
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
class JdbcOutboxStoreIT {
  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  static JdbcTemplate jdbc;
  static JdbcOutboxStore store;

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
    store = new JdbcOutboxStore(jdbc);
  }

  @Test
  void createsIndependentDeliveriesAndFencesAnExpiredLease() {
    Instant started = Instant.parse("2026-09-07T08:00:00Z");
    UUID eventId = UUID.randomUUID();
    store.append(
        eventId,
        new PublishEvent(
            null, "lesson.created", 1, UUID.randomUUID(), started, "{\"level\":\"B1\"}"),
        List.of("progress-projector", "notification-projector"),
        started);

    assertThat(
            jdbc.queryForObject(
                "select count(*) from platform_event_deliveries where event_id = ?",
                Integer.class,
                eventId))
        .isEqualTo(2);

    var first = store.claimNext("worker-a", started, Duration.ofSeconds(30)).orElseThrow();
    assertThat(first.eventId()).isEqualTo(eventId);
    assertThat(first.consumerName()).isIn("progress-projector", "notification-projector");
    assertThat(store.claimNext("worker-b", started.plusSeconds(20), Duration.ofSeconds(30)))
        .isPresent();

    var reclaimed =
        store.claimNext("worker-b", started.plusSeconds(31), Duration.ofSeconds(30)).orElseThrow();
    assertThat(reclaimed.deliveryId()).isEqualTo(first.deliveryId());
    assertThat(reclaimed.leaseGeneration()).isGreaterThan(first.leaseGeneration());
    assertThat(
            store.finish(
                first.deliveryId(),
                "worker-a",
                first.leaseGeneration(),
                DeliveryStatus.SUCCEEDED,
                null,
                null,
                started.plusSeconds(32)))
        .isFalse();
    assertThat(
            store.finish(
                reclaimed.deliveryId(),
                "worker-b",
                reclaimed.leaseGeneration(),
                DeliveryStatus.SUCCEEDED,
                null,
                null,
                started.plusSeconds(32)))
        .isTrue();
  }
}
