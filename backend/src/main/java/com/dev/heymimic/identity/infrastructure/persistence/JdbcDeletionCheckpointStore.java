package com.dev.heymimic.identity.infrastructure.persistence;

import com.dev.heymimic.identity.application.port.DeletionCheckpointStore;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcDeletionCheckpointStore implements DeletionCheckpointStore {
  private final JdbcTemplate jdbc;

  public JdbcDeletionCheckpointStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public void create(UUID userId, UUID jobId, Instant requestedAt) {
    jdbc.update(
        """
        insert into identity_deletion_tombstones (user_id, deletion_job_id, requested_at)
        values (?, ?, ?)
        on conflict (user_id) do nothing
        """,
        userId,
        jobId,
        Timestamp.from(requestedAt));
  }

  @Override
  public boolean isCompleted(UUID userId, String step) {
    Integer count =
        jdbc.queryForObject(
            "select count(*) from identity_deletion_steps where user_id = ? and step = ?",
            Integer.class,
            userId,
            step);
    return count != null && count == 1;
  }

  @Override
  @Transactional
  public void completeStep(UUID userId, String step, Instant completedAt) {
    jdbc.update(
        """
        insert into identity_deletion_steps (user_id, step, completed_at)
        values (?, ?, ?)
        on conflict (user_id, step) do nothing
        """,
        userId,
        step,
        Timestamp.from(completedAt));
  }

  @Override
  public void completeDeletion(UUID userId, Instant completedAt) {
    jdbc.update(
        """
        update identity_deletion_tombstones set completed_at = coalesce(completed_at, ?)
        where user_id = ?
        """,
        Timestamp.from(completedAt),
        userId);
  }
}
