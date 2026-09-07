package com.dev.heymimic.platform.infrastructure.persistence;

import com.dev.heymimic.platform.application.port.IdempotencyRecord;
import com.dev.heymimic.platform.application.port.IdempotencyStore;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcIdempotencyStore implements IdempotencyStore {
  private final JdbcTemplate jdbc;

  public JdbcIdempotencyStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public IdempotencyRecord begin(
      UUID recordId,
      UUID userId,
      String operation,
      UUID idempotencyKey,
      String requestHash,
      Instant now,
      Instant expiresAt) {
    jdbc.execute("set local lock_timeout = '2s'");
    String upsert =
        """
        insert into platform_idempotency_records
          (id, user_id, operation, idempotency_key, request_hash,
           response_status, response_body, expires_at, created_at)
        values (?, ?, ?, ?, ?, null, null, ?, ?)
        on conflict (user_id, operation, idempotency_key) do update
        set id = excluded.id, request_hash = excluded.request_hash,
            response_status = null, response_body = null,
            expires_at = excluded.expires_at, created_at = excluded.created_at
        where platform_idempotency_records.expires_at <= excluded.created_at
        returning id, request_hash, response_status, response_body
        """;
    List<IdempotencyRecord> changed =
        jdbc.query(
            upsert,
            this::mapRecord,
            recordId,
            userId,
            operation,
            idempotencyKey,
            requestHash,
            Timestamp.from(expiresAt),
            Timestamp.from(now));
    IdempotencyRecord record;
    if (!changed.isEmpty()) {
      record = changed.getFirst();
    } else {
      record =
          jdbc.queryForObject(
              """
              select id, request_hash, response_status, response_body
              from platform_idempotency_records
              where user_id = ? and operation = ? and idempotency_key = ?
              """,
              this::mapRecord,
              userId,
              operation,
              idempotencyKey);
    }
    jdbc.execute("set local lock_timeout = '0'");
    return record;
  }

  @Override
  public void complete(UUID recordId, int responseStatus, String responseBodyJson) {
    int updated =
        jdbc.update(
            """
            update platform_idempotency_records
            set response_status = ?, response_body = cast(? as jsonb)
            where id = ? and response_status is null
            """,
            responseStatus,
            responseBodyJson,
            recordId);
    if (updated != 1) {
      throw new IllegalStateException("Idempotency record could not be completed");
    }
  }

  private IdempotencyRecord mapRecord(ResultSet result, int rowNumber) throws SQLException {
    return new IdempotencyRecord(
        result.getObject("id", UUID.class),
        result.getString("request_hash"),
        result.getObject("response_status", Integer.class),
        result.getString("response_body"));
  }
}
