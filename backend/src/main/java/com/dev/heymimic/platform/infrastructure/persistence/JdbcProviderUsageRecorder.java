package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.ProviderBudgetManager;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageReceipt;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageRecorder;
import java.sql.Timestamp;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcProviderUsageRecorder implements ProviderUsageRecorder {
  private final JdbcTemplate jdbc;
  private final ProviderBudgetManager budgetManager;

  public JdbcProviderUsageRecorder(JdbcTemplate jdbc) {
    this(jdbc, ProviderBudgetManager.noop());
  }

  @Autowired
  public JdbcProviderUsageRecorder(JdbcTemplate jdbc, ProviderBudgetManager budgetManager) {
    this.jdbc = jdbc;
    this.budgetManager = budgetManager;
  }

  @Override
  public void record(ProviderUsageReceipt receipt) {
    var usage = receipt.usage();
    jdbc.update(
        """
        insert into platform_provider_usage
          (operation_id, resource_id, user_id, operation, stage, execution_attempt,
           provider, model, status, provider_request_id, input_tokens, output_tokens,
           audio_milliseconds, characters, error_code, recorded_at)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        on conflict (operation_id, stage, execution_attempt)
        do update set
          provider = excluded.provider,
          model = excluded.model,
          status = excluded.status,
          provider_request_id = excluded.provider_request_id,
          input_tokens = excluded.input_tokens,
          output_tokens = excluded.output_tokens,
          audio_milliseconds = excluded.audio_milliseconds,
          characters = excluded.characters,
          error_code = excluded.error_code,
          recorded_at = excluded.recorded_at
        """,
        receipt.operationId(),
        receipt.resourceId(),
        receipt.userId(),
        receipt.operation(),
        receipt.stage(),
        receipt.executionAttempt(),
        receipt.provider(),
        receipt.model(),
        receipt.status().name(),
        usage.requestId(),
        usage.inputTokens(),
        usage.outputTokens(),
        usage.audioMilliseconds(),
        usage.characters(),
        receipt.errorCode(),
        Timestamp.from(Instant.now()));
    budgetManager.reconcile(receipt);
  }
}
