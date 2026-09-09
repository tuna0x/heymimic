package com.dev.heymimic.platform.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.platform.application.PlatformEventDeliveryReplayService;
import com.dev.heymimic.platform.application.publicapi.DeliveryReplayCommand;
import com.dev.heymimic.platform.application.publicapi.DeliveryReplayOutcome;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class JdbcDeliveryReplayStoreIT {
  private static final Instant NOW = Instant.parse("2026-09-09T08:00:00Z");

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  static JdbcTemplate jdbc;
  static JdbcOutboxStore outbox;
  static JdbcDeliveryReplayStore replayStore;
  static TransactionTemplate transactions;

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
    outbox = new JdbcOutboxStore(jdbc);
    replayStore = new JdbcDeliveryReplayStore(jdbc);
    transactions = new TransactionTemplate(new DataSourceTransactionManager(dataSource));
  }

  @Test
  void dryRunAndReplayAreAuditedWhileOnlyReplayMutatesTheDelivery() {
    UUID eventId = UUID.randomUUID();
    outbox.append(
        eventId,
        new PublishEvent(null, "test.event", 1, UUID.randomUUID(), NOW, "{}"),
        List.of("progress-test-v1"),
        NOW);
    var claimed = outbox.claimNext("worker-a", NOW, Duration.ofMinutes(2)).orElseThrow();
    assertThat(
            outbox.finish(
                claimed.deliveryId(),
                "worker-a",
                claimed.leaseGeneration(),
                DeliveryStatus.FAILED_FINAL,
                "PROJECTION_FAILED",
                null,
                NOW.plusSeconds(1)))
        .isTrue();
    var service =
        new PlatformEventDeliveryReplayService(
            replayStore, Clock.fixed(NOW.plusSeconds(2), ZoneOffset.UTC));

    var dryRun =
        transactions.execute(
            ignored ->
                service.replay(
                    new DeliveryReplayCommand(
                        claimed.deliveryId(),
                        "ops@example.com",
                        "Verify replay after deploying projection fix",
                        true)));
    assertThat(dryRun.outcome()).isEqualTo(DeliveryReplayOutcome.DRY_RUN_ALLOWED);
    assertThat(status(claimed.deliveryId())).isEqualTo("FAILED_FINAL");

    var replayed =
        transactions.execute(
            ignored ->
                service.replay(
                    new DeliveryReplayCommand(
                        claimed.deliveryId(),
                        "ops@example.com",
                        "Replay after projection fix was verified",
                        false)));

    assertThat(replayed.outcome()).isEqualTo(DeliveryReplayOutcome.REQUEUED);
    assertThat(status(claimed.deliveryId())).isEqualTo("PENDING");
    assertThat(
            jdbc.queryForObject(
                "select attempts from platform_event_deliveries where id = ?",
                Integer.class,
                claimed.deliveryId()))
        .isZero();
    assertThat(
            jdbc.queryForObject(
                "select count(*) from platform_delivery_replay_audit where delivery_id = ?",
                Integer.class,
                claimed.deliveryId()))
        .isEqualTo(2);
  }

  private String status(UUID deliveryId) {
    return jdbc.queryForObject(
        "select status from platform_event_deliveries where id = ?", String.class, deliveryId);
  }
}
