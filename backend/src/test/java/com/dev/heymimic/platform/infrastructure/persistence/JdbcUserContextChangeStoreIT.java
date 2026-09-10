package com.dev.heymimic.platform.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class JdbcUserContextChangeStoreIT {
  private static final Instant NOW = Instant.parse("2026-09-09T08:00:00Z");

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  static JdbcTemplate jdbc;
  static JdbcOutboxStore outbox;
  static JdbcUserContextChangeStore context;
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
    context = new JdbcUserContextChangeStore(jdbc);
    transactions = new TransactionTemplate(new DataSourceTransactionManager(dataSource));
  }

  @Test
  void deduplicatesCauseAndAdvancesOnlyAfterContiguousDependenciesSucceed() {
    UUID userId = user();
    UUID firstEvent = event(userId, "progress-ledger-v1");
    long firstRevision = record(userId, firstEvent, List.of("progress-ledger-v1"));
    assertThat(record(userId, firstEvent, List.of("progress-ledger-v1"))).isEqualTo(firstRevision);

    UUID secondEvent = event(userId);
    long secondRevision = record(userId, secondEvent, List.of());
    assertThat(secondRevision).isEqualTo(firstRevision + 1);
    assertThat(context.get(userId, "learning").orElseThrow().readyCheckpointRevision()).isZero();

    var claimed =
        outbox.claimNext("context-test-worker", NOW, Duration.ofSeconds(30)).orElseThrow();
    assertThat(
            outbox.finish(
                claimed.deliveryId(),
                "context-test-worker",
                claimed.leaseGeneration(),
                DeliveryStatus.SUCCEEDED,
                null,
                null,
                NOW.plusSeconds(1)))
        .isTrue();

    var revision = context.get(userId, "learning").orElseThrow();
    assertThat(revision.revision()).isEqualTo(secondRevision);
    assertThat(revision.readyCheckpointRevision()).isEqualTo(secondRevision);
    assertThat(context.readiness(userId, "learning", secondRevision).isReady(secondRevision))
        .isTrue();
  }

  @Test
  void finalDependencyBlocksReadinessUntilAnExplicitReplaySucceeds() {
    UUID userId = user();
    UUID eventId = event(userId, "progress-ledger-v1");
    long revision = record(userId, eventId, List.of("progress-ledger-v1"));

    var claimed =
        outbox.claimNext("context-final-worker", NOW, Duration.ofSeconds(30)).orElseThrow();
    assertThat(
            outbox.finish(
                claimed.deliveryId(),
                "context-final-worker",
                claimed.leaseGeneration(),
                DeliveryStatus.FAILED_FINAL,
                "PROJECTION_FAILED",
                null,
                NOW.plusSeconds(1)))
        .isTrue();

    var readiness = context.readiness(userId, "learning", revision);
    assertThat(readiness.blocked()).isTrue();
    assertThat(readiness.isReady(revision)).isFalse();
  }

  @Test
  void missingRequiredConsumerRollsBackVersionChange() {
    UUID userId = user();
    UUID eventId = event(userId);

    assertThatThrownBy(() -> record(userId, eventId, List.of("consumer-does-not-exist")))
        .isInstanceOf(DataAccessException.class);

    assertThat(context.get(userId, "learning")).isEmpty();
    assertThat(
            jdbc.queryForObject(
                "select count(*) from platform_context_change_receipts where user_id = ?",
                Integer.class,
                userId))
        .isZero();
  }

  private long record(UUID userId, UUID eventId, List<String> consumers) {
    return transactions.execute(
        ignored -> context.record(userId, "learning", eventId, consumers, NOW));
  }

  private UUID event(UUID userId, String... consumers) {
    UUID eventId = UUID.randomUUID();
    outbox.append(
        eventId,
        new PublishEvent(userId, "context.test", 1, UUID.randomUUID(), NOW, "{}"),
        Arrays.asList(consumers),
        NOW);
    return eventId;
  }

  private UUID user() {
    UUID userId = UUID.randomUUID();
    Instant createdAt = NOW.minusSeconds(60);
    jdbc.update(
        """
        insert into identity_users
          (id, email_normalized, password_hash, status, created_at, updated_at)
        values (?, ?, 'test-hash', 'ACTIVE', ?, ?)
        """,
        userId,
        userId + "@example.com",
        Timestamp.from(createdAt),
        Timestamp.from(createdAt));
    return userId;
  }
}
