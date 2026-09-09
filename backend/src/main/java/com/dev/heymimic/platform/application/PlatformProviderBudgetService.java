package com.dev.heymimic.platform.application;

import com.dev.heymimic.platform.application.publicapi.ProviderBudgetManager;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetPolicy;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetRateCard;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetReservationCommand;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageReceipt;
import com.dev.heymimic.platform.domain.ProviderBudgetReservationStatus;
import com.dev.heymimic.shared.error.ApiException;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformProviderBudgetService implements ProviderBudgetManager {
  private final JdbcTemplate jdbc;
  private final ProviderBudgetPolicy policy;
  private final Clock clock;

  public PlatformProviderBudgetService(
      JdbcTemplate jdbc, ProviderBudgetPolicy policy, Clock clock) {
    this.jdbc = jdbc;
    this.policy = policy;
    this.clock = clock;
  }

  @Override
  @Transactional
  public void reserve(ProviderBudgetReservationCommand command) {
    if (!policy.enabled()) return;

    long estimate =
        policy
            .estimatedCostMicros(command.operation(), command.stage())
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "PROVIDER_BUDGET_POLICY_MISSING",
                        "No provider budget estimate is configured for "
                            + command.operation()
                            + "."
                            + command.stage()));
    LocalDate budgetDate = LocalDate.ofInstant(clock.instant(), ZoneOffset.UTC);
    lockBudget(budgetDate);
    if (hasReservation(command)) return;

    long reserved = reservedAmount(budgetDate);
    if (policy.dailyLimitMicros() > 0 && (estimate > policy.dailyLimitMicros() - reserved)) {
      throw new ApiException(
          HttpStatus.TOO_MANY_REQUESTS,
          "PROVIDER_BUDGET_EXCEEDED",
          "The provider budget for today has been reserved");
    }

    Instant now = clock.instant();
    ProviderBudgetRateCard rateCard = policy.rateCard();
    jdbc.update(
        """
        insert into platform_provider_budget_reservations
          (operation_id, stage, execution_attempt, resource_id, user_id, budget_date,
           estimated_cost_micros, actual_cost_micros, rate_card_version,
           input_token_micros_per_million, output_token_micros_per_million,
           audio_micros_per_minute, character_micros_per_thousand, status, created_at, updated_at)
        values (?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?, ?, 'RESERVED', ?, ?)
        """,
        command.operationId(),
        command.stage(),
        command.executionAttempt(),
        command.resourceId(),
        command.userId(),
        Date.valueOf(budgetDate),
        estimate,
        policy.rateCardVersion(),
        rateCard.inputTokenMicrosPerMillion(),
        rateCard.outputTokenMicrosPerMillion(),
        rateCard.audioMicrosPerMinute(),
        rateCard.characterMicrosPerThousand(),
        Timestamp.from(now),
        Timestamp.from(now));
  }

  @Override
  @Transactional
  public void reconcile(ProviderUsageReceipt receipt) {
    BudgetReservation reservation = findReservation(receipt);
    if (reservation == null) return;
    lockBudget(reservation.budgetDate());
    reservation = findReservation(receipt);
    if (reservation == null
        || reservation.status() == ProviderBudgetReservationStatus.RECONCILED
        || reservation.status() == ProviderBudgetReservationStatus.RELEASED) {
      return;
    }

    boolean knownSuccess =
        receipt.status()
                == com.dev.heymimic.platform.application.publicapi.ProviderCallStatus.SUCCEEDED
            && policy.hasKnownUsage(receipt.operation(), receipt.stage(), receipt.usage());
    ProviderBudgetReservationStatus target =
        knownSuccess
            ? ProviderBudgetReservationStatus.RECONCILED
            : ProviderBudgetReservationStatus.UNKNOWN;
    Long actual =
        knownSuccess
            ? reservation.rateCard() == null
                ? policy.actualCostMicros(receipt.usage())
                : policy.actualCostMicros(receipt.usage(), reservation.rateCard())
            : null;
    jdbc.update(
        """
        update platform_provider_budget_reservations
        set status = ?, actual_cost_micros = ?, updated_at = ?
        where operation_id = ? and stage = ? and execution_attempt = ?
        """,
        target.name(),
        actual,
        Timestamp.from(clock.instant()),
        receipt.operationId(),
        receipt.stage(),
        receipt.executionAttempt());
  }

  private void lockBudget(LocalDate budgetDate) {
    jdbc.query(
        "select pg_advisory_xact_lock(hashtextextended(?, 0))",
        result -> null,
        "provider-budget|" + budgetDate);
  }

  private boolean hasReservation(ProviderBudgetReservationCommand command) {
    List<Integer> rows =
        jdbc.query(
            """
            select 1 from platform_provider_budget_reservations
            where operation_id = ? and stage = ? and execution_attempt = ?
            """,
            (result, rowNumber) -> result.getInt(1),
            command.operationId(),
            command.stage(),
            command.executionAttempt());
    return !rows.isEmpty();
  }

  private long reservedAmount(LocalDate budgetDate) {
    Long accounted =
        jdbc.queryForObject(
            """
            select
              coalesce((
                select sum(
                  case
                    when status = 'RECONCILED' then coalesce(actual_cost_micros, estimated_cost_micros)
                    when status in ('RESERVED', 'UNKNOWN') then estimated_cost_micros
                    else 0
                  end)
                from platform_provider_budget_reservations
                where budget_date = ?
              ), 0)
              + coalesce((
                select amount_micros
                from platform_provider_budget_purge_totals
                where budget_date = ?
              ), 0)
            """,
            Long.class,
            Date.valueOf(budgetDate),
            Date.valueOf(budgetDate));
    return accounted == null ? 0 : accounted;
  }

  private BudgetReservation findReservation(ProviderUsageReceipt receipt) {
    List<BudgetReservation> rows =
        jdbc.query(
            """
            select budget_date, status, input_token_micros_per_million,
                   output_token_micros_per_million, audio_micros_per_minute,
                   character_micros_per_thousand
            from platform_provider_budget_reservations
            where operation_id = ? and stage = ? and execution_attempt = ?
            """,
            (result, rowNumber) -> {
              Long inputRate = result.getObject("input_token_micros_per_million", Long.class);
              Long outputRate = result.getObject("output_token_micros_per_million", Long.class);
              Long audioRate = result.getObject("audio_micros_per_minute", Long.class);
              Long characterRate = result.getObject("character_micros_per_thousand", Long.class);
              ProviderBudgetRateCard rateCard =
                  inputRate == null
                          || outputRate == null
                          || audioRate == null
                          || characterRate == null
                      ? null
                      : new ProviderBudgetRateCard(inputRate, outputRate, audioRate, characterRate);
              return new BudgetReservation(
                  result.getObject("budget_date", LocalDate.class),
                  ProviderBudgetReservationStatus.valueOf(result.getString("status")),
                  rateCard);
            },
            receipt.operationId(),
            receipt.stage(),
            receipt.executionAttempt());
    return rows.stream().findFirst().orElse(null);
  }

  private record BudgetReservation(
      LocalDate budgetDate,
      ProviderBudgetReservationStatus status,
      ProviderBudgetRateCard rateCard) {}
}
