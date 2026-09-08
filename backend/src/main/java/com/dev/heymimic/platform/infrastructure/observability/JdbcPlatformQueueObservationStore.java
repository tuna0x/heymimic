package com.dev.heymimic.platform.infrastructure.observability;

import java.sql.Timestamp;
import java.time.Instant;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcPlatformQueueObservationStore implements PlatformQueueObservationStore {
  private final JdbcTemplate jdbc;

  public JdbcPlatformQueueObservationStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public QueueObservation observeJobs(Instant now) {
    String sql =
        """
        select count(*) as due_count,
               coalesce(
                 greatest(
                   extract(epoch from (
                     cast(? as timestamptz)
                     - min(case when status = 'RUNNING' then lease_until else next_attempt_at end)
                   )),
                   0
                 ),
                 0
               )::bigint as oldest_age_seconds
        from platform_jobs
        where (status in ('PENDING', 'FAILED_RETRYABLE') and next_attempt_at <= ?)
           or (status = 'RUNNING' and lease_until < ?)
        """;
    Timestamp observedAt = Timestamp.from(now);
    return jdbc.queryForObject(
        sql,
        (result, rowNumber) ->
            new QueueObservation(result.getLong("due_count"), result.getLong("oldest_age_seconds")),
        observedAt,
        observedAt,
        observedAt);
  }

  @Override
  public QueueObservation observeDeliveries(Instant now) {
    String sql =
        """
        select count(*) as due_count,
               coalesce(
                 greatest(
                   extract(epoch from (cast(? as timestamptz) - min(event.occurred_at))),
                   0
                 ),
                 0
               )::bigint as oldest_age_seconds
        from platform_event_deliveries delivery
        join platform_outbox_events event on event.id = delivery.event_id
        where (delivery.status in ('PENDING', 'FAILED_RETRYABLE')
               and delivery.next_attempt_at <= ?)
           or (delivery.status = 'RUNNING' and delivery.lease_until < ?)
        """;
    Timestamp observedAt = Timestamp.from(now);
    return jdbc.queryForObject(
        sql,
        (result, rowNumber) ->
            new QueueObservation(result.getLong("due_count"), result.getLong("oldest_age_seconds")),
        observedAt,
        observedAt,
        observedAt);
  }
}
