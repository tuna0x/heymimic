package com.dev.heymimic.identity.infrastructure.persistence;

import com.dev.heymimic.identity.application.port.RotationResult;
import com.dev.heymimic.identity.application.port.SessionStore;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcSessionStore implements SessionStore {
  private final JdbcTemplate jdbc;

  public JdbcSessionStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public void create(
      UUID familyId,
      UUID tokenId,
      UUID userId,
      String tokenHash,
      Instant familyExpiresAt,
      Instant tokenExpiresAt,
      Instant now) {
    jdbc.update(
        """
        insert into identity_session_families (id, user_id, expires_at, created_at)
        values (?, ?, ?, ?)
        """,
        familyId,
        userId,
        Timestamp.from(familyExpiresAt),
        Timestamp.from(now));
    jdbc.update(
        """
        insert into identity_refresh_tokens
          (id, user_id, family_id, token_hash, parent_id, expires_at, created_at)
        values (?, ?, ?, ?, null, ?, ?)
        """,
        tokenId,
        userId,
        familyId,
        tokenHash,
        Timestamp.from(tokenExpiresAt),
        Timestamp.from(now));
  }

  @Override
  public RotationResult rotate(
      String tokenHash,
      UUID successorId,
      String successorHash,
      Instant successorExpiresAt,
      Instant now) {
    TokenRow current = lockToken(tokenHash).orElse(null);
    if (current == null || current.familyRevokedAt() != null) return RotationResult.invalid();

    if (current.consumedAt() != null) {
      revokeFamily(current.familyId(), now);
      return RotationResult.reused(current.userId(), current.familyId());
    }
    if (current.tokenRevokedAt() != null
        || !current.tokenExpiresAt().isAfter(now)
        || !current.familyExpiresAt().isAfter(now)) {
      return RotationResult.invalid();
    }

    int consumed =
        jdbc.update(
            "update identity_refresh_tokens set consumed_at = ? where id = ? and consumed_at is null",
            Timestamp.from(now),
            current.tokenId());
    if (consumed != 1) {
      revokeFamily(current.familyId(), now);
      return RotationResult.reused(current.userId(), current.familyId());
    }

    Instant effectiveExpiry =
        successorExpiresAt.isBefore(current.familyExpiresAt())
            ? successorExpiresAt
            : current.familyExpiresAt();
    jdbc.update(
        """
        insert into identity_refresh_tokens
          (id, user_id, family_id, token_hash, parent_id, expires_at, created_at)
        values (?, ?, ?, ?, ?, ?, ?)
        """,
        successorId,
        current.userId(),
        current.familyId(),
        successorHash,
        current.tokenId(),
        Timestamp.from(effectiveExpiry),
        Timestamp.from(now));
    return RotationResult.rotated(current.userId(), current.familyId());
  }

  @Override
  public Optional<UUID> revokeFamilyByTokenHash(String tokenHash, Instant now) {
    return lockToken(tokenHash)
        .map(
            token -> {
              revokeFamily(token.familyId(), now);
              return token.familyId();
            });
  }

  @Override
  public void revokeAllForUser(UUID userId, Instant now) {
    jdbc.update(
        """
        update identity_session_families
        set revoked_at = coalesce(revoked_at, ?)
        where user_id = ?
        """,
        Timestamp.from(now),
        userId);
    jdbc.update(
        """
        update identity_refresh_tokens
        set revoked_at = coalesce(revoked_at, ?)
        where user_id = ?
        """,
        Timestamp.from(now),
        userId);
  }

  @Override
  public void deleteAllForUser(UUID userId) {
    jdbc.update("delete from identity_refresh_tokens where user_id = ?", userId);
    jdbc.update("delete from identity_session_families where user_id = ?", userId);
  }

  @Override
  public boolean isFamilyActive(UUID familyId, UUID userId, Instant now) {
    Boolean active =
        jdbc.queryForObject(
            """
            select exists (
              select 1 from identity_session_families
              where id = ? and user_id = ? and revoked_at is null and expires_at > ?
            )
            """,
            Boolean.class,
            familyId,
            userId,
            Timestamp.from(now));
    return Boolean.TRUE.equals(active);
  }

  private Optional<TokenRow> lockToken(String tokenHash) {
    return jdbc.query(
        """
        select t.id as token_id, t.user_id, t.family_id, t.expires_at as token_expires_at,
               t.consumed_at, t.revoked_at as token_revoked_at,
               f.expires_at as family_expires_at, f.revoked_at as family_revoked_at
        from identity_refresh_tokens t
        join identity_session_families f on f.id = t.family_id
        where t.token_hash = ?
        for update of f, t
        """,
        result -> result.next() ? Optional.of(map(result)) : Optional.empty(),
        tokenHash);
  }

  private void revokeFamily(UUID familyId, Instant now) {
    jdbc.update(
        "update identity_session_families set revoked_at = coalesce(revoked_at, ?) where id = ?",
        Timestamp.from(now),
        familyId);
    jdbc.update(
        "update identity_refresh_tokens set revoked_at = coalesce(revoked_at, ?) where family_id = ?",
        Timestamp.from(now),
        familyId);
  }

  private TokenRow map(ResultSet result) throws SQLException {
    return new TokenRow(
        result.getObject("token_id", UUID.class),
        result.getObject("user_id", UUID.class),
        result.getObject("family_id", UUID.class),
        result.getTimestamp("token_expires_at").toInstant(),
        instant(result, "consumed_at"),
        instant(result, "token_revoked_at"),
        result.getTimestamp("family_expires_at").toInstant(),
        instant(result, "family_revoked_at"));
  }

  private Instant instant(ResultSet result, String column) throws SQLException {
    Timestamp value = result.getTimestamp(column);
    return value == null ? null : value.toInstant();
  }

  private record TokenRow(
      UUID tokenId,
      UUID userId,
      UUID familyId,
      Instant tokenExpiresAt,
      Instant consumedAt,
      Instant tokenRevokedAt,
      Instant familyExpiresAt,
      Instant familyRevokedAt) {}
}
