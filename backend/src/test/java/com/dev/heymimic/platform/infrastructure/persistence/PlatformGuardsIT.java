package com.dev.heymimic.platform.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dev.heymimic.platform.application.PlatformIdempotencyService;
import com.dev.heymimic.platform.application.PlatformQuotaService;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.ReserveQuota;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
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
class PlatformGuardsIT {
  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  static JdbcTemplate jdbc;
  static TransactionTemplate transactions;
  static PlatformIdempotencyService idempotency;
  static PlatformQuotaService quotas;

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
    transactions = new TransactionTemplate(new DataSourceTransactionManager(dataSource));
    Clock clock = Clock.fixed(Instant.parse("2026-09-07T08:00:00Z"), ZoneOffset.UTC);
    idempotency = new PlatformIdempotencyService(new JdbcIdempotencyStore(jdbc), clock);
    quotas = new PlatformQuotaService(new JdbcQuotaStore(jdbc), ignored -> 1, clock);
  }

  @Test
  void idempotencyReplaysCommittedResponseAndRejectsDifferentRequest() {
    UUID userId = UUID.randomUUID();
    UUID key = UUID.randomUUID();
    var command =
        new IdempotencyCommand(
            userId, "speaking.evaluate", key, "attempt=one", Duration.ofHours(24));
    int[] executions = {0};

    IdempotentResponse first =
        transactions.execute(
            ignored ->
                idempotency.execute(
                    command,
                    () -> {
                      executions[0]++;
                      return IdempotentResponse.fresh(202, "{\"evaluationId\":\"one\"}");
                    }));
    IdempotentResponse replay =
        transactions.execute(
            ignored ->
                idempotency.execute(
                    command,
                    () -> {
                      executions[0]++;
                      return IdempotentResponse.fresh(500, "{}");
                    }));

    assertThat(first.replayed()).isFalse();
    assertThat(replay.replayed()).isTrue();
    assertThat(replay.status()).isEqualTo(202);
    assertThat(executions[0]).isEqualTo(1);
    var reused =
        new IdempotencyCommand(
            userId, "speaking.evaluate", key, "attempt=two", Duration.ofHours(24));
    assertThatThrownBy(
            () ->
                transactions.execute(
                    ignored ->
                        idempotency.execute(reused, () -> IdempotentResponse.fresh(202, "{}"))))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("IDEMPOTENCY_KEY_REUSED"));
  }

  @Test
  void failedBusinessOperationRollsBackIdempotencyPlaceholder() {
    UUID key = UUID.randomUUID();
    var command =
        new IdempotencyCommand(
            UUID.randomUUID(), "review.rate", key, "rating=again", Duration.ofHours(24));
    assertThatThrownBy(
            () ->
                transactions.execute(
                    ignored ->
                        idempotency.execute(
                            command,
                            () -> {
                              throw new IllegalStateException("business failed");
                            })))
        .isInstanceOf(IllegalStateException.class);

    IdempotentResponse retried =
        transactions.execute(
            ignored ->
                idempotency.execute(
                    command, () -> IdempotentResponse.fresh(200, "{\"saved\":true}")));
    assertThat(retried.replayed()).isFalse();
    assertThat(
            jdbc.queryForObject(
                "select count(*) from platform_idempotency_records where idempotency_key = ?",
                Integer.class,
                key))
        .isEqualTo(1);
  }

  @Test
  void releasedQuotaCanBeReusedButConsumedQuotaCannot() {
    UUID userId = UUID.randomUUID();
    UUID firstResource = UUID.randomUUID();
    UUID first =
        transactions.execute(
            ignored -> quotas.reserve(new ReserveQuota(userId, firstResource, "AI_CALL", 1)));
    UUID replay =
        transactions.execute(
            ignored -> quotas.reserve(new ReserveQuota(userId, firstResource, "AI_CALL", 1)));
    assertThat(replay).isEqualTo(first);

    assertThatThrownBy(
            () ->
                transactions.execute(
                    ignored ->
                        quotas.reserve(new ReserveQuota(userId, UUID.randomUUID(), "AI_CALL", 1))))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("QUOTA_EXCEEDED"));

    transactions.executeWithoutResult(ignored -> quotas.release(first, userId));
    UUID second =
        transactions.execute(
            ignored -> quotas.reserve(new ReserveQuota(userId, UUID.randomUUID(), "AI_CALL", 1)));
    transactions.executeWithoutResult(ignored -> quotas.consume(second, userId));
    assertThatThrownBy(
            () -> transactions.executeWithoutResult(ignored -> quotas.release(second, userId)))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception ->
                assertThat(exception.code()).isEqualTo("QUOTA_RESERVATION_STATE_CONFLICT"));
  }

  @Test
  void concurrentReservationsCannotExceedOneUnitDailyLimit() throws Exception {
    UUID userId = UUID.randomUUID();
    Callable<Boolean> reserve =
        () -> {
          try {
            transactions.execute(
                ignored ->
                    quotas.reserve(
                        new ReserveQuota(userId, UUID.randomUUID(), "CONCURRENT_AI", 1)));
            return true;
          } catch (ApiException exception) {
            assertThat(exception.code()).isEqualTo("QUOTA_EXCEEDED");
            return false;
          }
        };

    try (var executor = Executors.newFixedThreadPool(2)) {
      var first = executor.submit(reserve);
      var second = executor.submit(reserve);
      assertThat(first.get() ? 1 : 0).isNotEqualTo(second.get() ? 1 : 0);
    }
    assertThat(
            jdbc.queryForObject(
                """
                select count(*) from platform_quota_reservations
                where user_id = ? and quota_kind = 'CONCURRENT_AI' and status = 'RESERVED'
                """,
                Integer.class,
                userId))
        .isEqualTo(1);
  }
}
