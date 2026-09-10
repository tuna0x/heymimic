package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.port.OutboxStore;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcOutboxStore implements OutboxStore {
  private final JdbcTemplate jdbc;

  public JdbcOutboxStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public void append(
      UUID eventId, PublishEvent event, Collection<String> consumerNames, Instant createdAt) {
    jdbc.update(
        """
        insert into platform_outbox_events
          (id, owner_user_id, event_type, schema_version, aggregate_id, occurred_at, payload)
        values (?, ?, ?, ?, ?, ?, cast(? as jsonb))
        """,
        eventId,
        event.ownerUserId(),
        event.eventType(),
        event.schemaVersion(),
        event.aggregateId(),
        Timestamp.from(event.occurredAt()),
        event.payloadJson());

    for (String consumerName : consumerNames) {
      jdbc.update(
          """
          insert into platform_event_deliveries
            (id, event_id, consumer_name, status, attempts, next_attempt_at,
             lease_generation, created_at, updated_at)
          values (?, ?, ?, 'PENDING', 0, ?, 0, ?, ?)
          on conflict (event_id, consumer_name) do nothing
          """,
          UUID.randomUUID(),
          eventId,
          consumerName,
          Timestamp.from(createdAt),
          Timestamp.from(createdAt),
          Timestamp.from(createdAt));
    }
  }

  @Override
  public Optional<PublishedEvent> claimNext(String workerId, Instant now, Duration lease) {
    String sql =
        """
        with candidate as (
          select id from platform_event_deliveries
          where ((status in ('PENDING', 'FAILED_RETRYABLE') and next_attempt_at <= ?)
              or (status = 'RUNNING' and lease_until < ?))
          order by next_attempt_at, id
          for update skip locked
          limit 1
        ), claimed as (
          update platform_event_deliveries delivery
          set status = 'RUNNING', attempts = attempts + 1, lease_owner = ?,
              lease_generation = lease_generation + 1, lease_until = ?, updated_at = ?
          from candidate where delivery.id = candidate.id
          returning delivery.*
        )
        select claimed.id as delivery_id, claimed.consumer_name, claimed.attempts, claimed.lease_generation,
               claimed.lease_until, event.*
        from claimed join platform_outbox_events event on event.id = claimed.event_id
        """;
    List<PublishedEvent> events =
        jdbc.query(
            sql,
            this::mapPublishedEvent,
            Timestamp.from(now),
            Timestamp.from(now),
            workerId,
            Timestamp.from(now.plus(lease)),
            Timestamp.from(now));
    return events.stream().findFirst();
  }

  @Override
  public boolean finish(
      UUID deliveryId,
      String workerId,
      long generation,
      DeliveryStatus status,
      String errorCode,
      Instant nextAttemptAt,
      Instant now) {
    String sql =
        """
        update platform_event_deliveries
        set status = ?, last_error_code = ?, next_attempt_at = coalesce(?, next_attempt_at),
            lease_owner = null, lease_until = null, updated_at = ?
        where id = ? and status = 'RUNNING' and lease_owner = ?
          and lease_generation = ? and lease_until >= ?
        """;
    Timestamp next = nextAttemptAt == null ? null : Timestamp.from(nextAttemptAt);
    int updated =
        jdbc.update(
            sql,
            status.name(),
            errorCode,
            next,
            Timestamp.from(now),
            deliveryId,
            workerId,
            generation,
            Timestamp.from(now));
    if (updated == 1) {
      advanceContextCheckpoints(deliveryId);
    }
    return updated == 1;
  }

  private void advanceContextCheckpoints(UUID deliveryId) {
    jdbc.update(
        """
        update platform_user_context_versions version
        set ready_checkpoint_revision = coalesce((
          select min(change.revision) - 1 from platform_user_context_changes change
          where change.user_id = version.user_id and change.context_key = version.context_key
            and change.revision <= version.revision
            and exists (
              select 1 from platform_context_change_deliveries dependency
              join platform_event_deliveries delivery on delivery.id = dependency.delivery_id
              where dependency.change_id = change.id and delivery.status <> 'SUCCEEDED'
            )
        ), version.revision)
        where exists (
          select 1 from platform_user_context_changes change
          join platform_context_change_deliveries dependency on dependency.change_id = change.id
          where dependency.delivery_id = ?
            and change.user_id = version.user_id and change.context_key = version.context_key
        )
        """,
        deliveryId);
  }

  PublishedEvent mapPublishedEvent(ResultSet result, int rowNumber) throws SQLException {
    return new PublishedEvent(
        result.getObject("delivery_id", UUID.class),
        result.getString("consumer_name"),
        result.getObject("id", UUID.class),
        result.getObject("owner_user_id", UUID.class),
        result.getString("event_type"),
        result.getInt("schema_version"),
        result.getObject("aggregate_id", UUID.class),
        result.getTimestamp("occurred_at").toInstant(),
        result.getString("payload"),
        result.getInt("attempts"),
        result.getLong("lease_generation"),
        result.getTimestamp("lease_until").toInstant());
  }
}
