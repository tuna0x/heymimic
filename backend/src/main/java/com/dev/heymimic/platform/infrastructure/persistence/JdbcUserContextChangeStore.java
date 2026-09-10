package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.UserContextChangeStore;
import com.dev.heymimic.platform.application.publicapi.UserContextReadiness;
import com.dev.heymimic.platform.application.publicapi.UserContextRevision;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcUserContextChangeStore implements UserContextChangeStore {
  private final JdbcTemplate jdbc;

  public JdbcUserContextChangeStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public long record(
      UUID userId,
      String contextKey,
      UUID causeEventId,
      List<String> requiredConsumers,
      Instant now) {
    jdbc.update(
        """
        insert into platform_user_context_versions(user_id, context_key, revision, updated_at)
        values (?, ?, 0, ?) on conflict (user_id, context_key) do nothing
        """,
        userId,
        contextKey,
        Timestamp.from(now));
    Long existing =
        jdbc
            .query(
                """
                select revision from platform_context_change_receipts
                where user_id = ? and context_key = ? and cause_event_id = ?
                """,
                (result, row) -> result.getLong("revision"),
                userId,
                contextKey,
                causeEventId)
            .stream()
            .findFirst()
            .orElse(null);
    if (existing != null) return existing;

    long revision =
        jdbc.queryForObject(
            """
            update platform_user_context_versions
            set revision = revision + 1, updated_at = ?
            where user_id = ? and context_key = ?
            returning revision
            """,
            Long.class,
            Timestamp.from(now),
            userId,
            contextKey);
    UUID changeId = UUID.randomUUID();
    jdbc.update(
        """
        insert into platform_user_context_changes
          (id, user_id, context_key, revision, cause_event_id, created_at)
        values (?, ?, ?, ?, ?, ?)
        """,
        changeId,
        userId,
        contextKey,
        revision,
        causeEventId,
        Timestamp.from(now));
    jdbc.update(
        """
        insert into platform_context_change_receipts
          (user_id, context_key, cause_event_id, revision, recorded_at)
        values (?, ?, ?, ?, ?)
        """,
        userId,
        contextKey,
        causeEventId,
        revision,
        Timestamp.from(now));
    for (String consumer : requiredConsumers.stream().distinct().toList()) {
      UUID deliveryId =
          jdbc.queryForObject(
              """
              select id from platform_event_deliveries
              where event_id = ? and consumer_name = ?
              """,
              UUID.class,
              causeEventId,
              consumer);
      jdbc.update(
          """
          insert into platform_context_change_deliveries(change_id, delivery_id)
          values (?, ?)
          """,
          changeId,
          deliveryId);
    }
    advanceReadyCheckpoint(userId, contextKey);
    return revision;
  }

  private void advanceReadyCheckpoint(UUID userId, String contextKey) {
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
        where version.user_id = ? and version.context_key = ?
        """,
        userId,
        contextKey);
  }

  @Override
  public Optional<UserContextRevision> get(UUID userId, String contextKey) {
    return jdbc
        .query(
            """
            select user_id, context_key, revision, ready_checkpoint_revision, updated_at
            from platform_user_context_versions where user_id = ? and context_key = ?
            """,
            (result, row) ->
                new UserContextRevision(
                    result.getObject("user_id", UUID.class),
                    result.getString("context_key"),
                    result.getLong("revision"),
                    result.getLong("ready_checkpoint_revision"),
                    result.getTimestamp("updated_at").toInstant()),
            userId,
            contextKey)
        .stream()
        .findFirst();
  }

  @Override
  public UserContextReadiness readiness(UUID userId, String contextKey, long revision) {
    return jdbc
        .query(
            """
            select version.revision, version.ready_checkpoint_revision,
              exists(select 1 from platform_user_context_changes change
                join platform_context_change_deliveries dependency on dependency.change_id = change.id
                join platform_event_deliveries delivery on delivery.id = dependency.delivery_id
                where change.user_id = version.user_id and change.context_key = version.context_key
                  and change.revision <= ? and delivery.status = 'FAILED_FINAL') as blocked
            from platform_user_context_versions version
            where version.user_id = ? and version.context_key = ?
            """,
            (result, row) ->
                new UserContextReadiness(
                    result.getLong("revision"),
                    result.getLong("ready_checkpoint_revision"),
                    result.getBoolean("blocked")),
            revision,
            userId,
            contextKey)
        .stream()
        .findFirst()
        .orElse(new UserContextReadiness(0, 0, false));
  }
}
