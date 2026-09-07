package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.port.JobStore;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.domain.JobStatus;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcJobStore implements JobStore {
  private final JdbcTemplate jdbc;

  public JdbcJobStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public UUID enqueue(UUID jobId, EnqueueJob command, Instant now) {
    String sql =
        """
        insert into platform_jobs
          (id, owner_user_id, type, resource_id, status, payload_version, payload,
           attempts, next_attempt_at, lease_generation, created_at, updated_at)
        values (?, ?, ?, ?, 'PENDING', ?, cast(? as jsonb), 0, ?, 0, ?, ?)
        on conflict (type, resource_id) do update set type = excluded.type
        returning id
        """;
    return jdbc.queryForObject(
        sql,
        UUID.class,
        jobId,
        command.ownerUserId(),
        command.type(),
        command.resourceId(),
        command.payloadVersion(),
        command.payloadJson(),
        Timestamp.from(command.runAt()),
        Timestamp.from(now),
        Timestamp.from(now));
  }

  @Override
  public Optional<ClaimedJob> claimNext(String workerId, Instant now, Duration lease) {
    String sql =
        """
        with candidate as (
          select id from platform_jobs
          where ((status in ('PENDING', 'FAILED_RETRYABLE') and next_attempt_at <= ?)
              or (status = 'RUNNING' and lease_until < ?))
          order by next_attempt_at, id
          for update skip locked
          limit 1
        )
        update platform_jobs job
        set status = 'RUNNING', attempts = attempts + 1, lease_owner = ?,
            lease_generation = lease_generation + 1, lease_until = ?, updated_at = ?
        from candidate where job.id = candidate.id
        returning job.*
        """;
    List<ClaimedJob> jobs =
        jdbc.query(
            sql,
            this::mapClaimedJob,
            Timestamp.from(now),
            Timestamp.from(now),
            workerId,
            Timestamp.from(now.plus(lease)),
            Timestamp.from(now));
    return jobs.stream().findFirst();
  }

  @Override
  public boolean heartbeat(UUID id, String worker, long generation, Instant now, Duration lease) {
    String sql =
        """
        update platform_jobs set lease_until = ?, updated_at = ?
        where id = ? and status = 'RUNNING' and lease_owner = ?
          and lease_generation = ? and lease_until >= ?
        """;
    return jdbc.update(
            sql,
            Timestamp.from(now.plus(lease)),
            Timestamp.from(now),
            id,
            worker,
            generation,
            Timestamp.from(now))
        == 1;
  }

  @Override
  public boolean saveCheckpoint(
      UUID id, String worker, long generation, String checkpointJson, Instant now) {
    String sql =
        """
        update platform_jobs set checkpoint = cast(? as jsonb), updated_at = ?
        where id = ? and status = 'RUNNING' and lease_owner = ?
          and lease_generation = ? and lease_until >= ?
        """;
    return jdbc.update(
            sql, checkpointJson, Timestamp.from(now), id, worker, generation, Timestamp.from(now))
        == 1;
  }

  @Override
  public boolean finish(
      UUID id,
      String worker,
      long generation,
      JobStatus status,
      String errorCode,
      Instant nextAttemptAt,
      Instant now) {
    String sql =
        """
        update platform_jobs
        set status = ?, last_error_code = ?, next_attempt_at = coalesce(?, next_attempt_at),
            lease_owner = null, lease_until = null, updated_at = ?
        where id = ? and status = 'RUNNING' and lease_owner = ?
          and lease_generation = ? and lease_until >= ?
        """;
    Timestamp next = nextAttemptAt == null ? null : Timestamp.from(nextAttemptAt);
    return jdbc.update(
            sql,
            status.name(),
            errorCode,
            next,
            Timestamp.from(now),
            id,
            worker,
            generation,
            Timestamp.from(now))
        == 1;
  }

  private ClaimedJob mapClaimedJob(ResultSet result, int rowNumber) throws SQLException {
    Timestamp leaseUntil = result.getTimestamp("lease_until");
    return new ClaimedJob(
        result.getObject("id", UUID.class),
        result.getObject("owner_user_id", UUID.class),
        result.getString("type"),
        result.getObject("resource_id", UUID.class),
        result.getInt("payload_version"),
        result.getString("payload"),
        result.getString("checkpoint"),
        result.getInt("attempts"),
        result.getLong("lease_generation"),
        leaseUntil.toInstant());
  }
}
