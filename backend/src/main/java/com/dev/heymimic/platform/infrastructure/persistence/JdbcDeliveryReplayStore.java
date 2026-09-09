package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.port.DeliveryReplayAudit;
import com.dev.heymimic.platform.application.port.DeliveryReplayCandidate;
import com.dev.heymimic.platform.application.port.DeliveryReplayStore;
import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcDeliveryReplayStore implements DeliveryReplayStore {
  private final JdbcTemplate jdbc;

  public JdbcDeliveryReplayStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public Optional<DeliveryReplayCandidate> lockDelivery(UUID deliveryId) {
    return jdbc
        .query(
            """
            select delivery.id, delivery.event_id, delivery.consumer_name, delivery.status,
                   delivery.attempts, delivery.last_error_code
            from platform_event_deliveries delivery
            where delivery.id = ?
            for update
            """,
            (result, rowNumber) ->
                new DeliveryReplayCandidate(
                    result.getObject("id", UUID.class),
                    result.getObject("event_id", UUID.class),
                    result.getString("consumer_name"),
                    DeliveryStatus.valueOf(result.getString("status")),
                    result.getInt("attempts"),
                    result.getString("last_error_code")),
            deliveryId)
        .stream()
        .findFirst();
  }

  @Override
  public boolean requeueFinalDelivery(UUID deliveryId, Instant now) {
    return jdbc.update(
            """
            update platform_event_deliveries
            set status = 'PENDING', attempts = 0, next_attempt_at = ?,
                lease_until = null, lease_owner = null, last_error_code = null, updated_at = ?
            where id = ? and status = 'FAILED_FINAL'
            """,
            Timestamp.from(now),
            Timestamp.from(now),
            deliveryId)
        == 1;
  }

  @Override
  public void appendAudit(DeliveryReplayAudit audit) {
    jdbc.update(
        """
        insert into platform_delivery_replay_audit
          (id, delivery_id, event_id, consumer_name, previous_status, previous_attempts,
           previous_error_code, operator_identity, reason, dry_run, outcome, requested_at)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        audit.id(),
        audit.deliveryId(),
        audit.eventId(),
        audit.consumerName(),
        audit.previousStatus(),
        audit.previousAttempts(),
        audit.previousErrorCode(),
        audit.operatorIdentity(),
        audit.reason(),
        audit.dryRun(),
        audit.outcome().name(),
        Timestamp.from(audit.requestedAt()));
  }
}
