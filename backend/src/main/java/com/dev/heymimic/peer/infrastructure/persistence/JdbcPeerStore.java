package com.dev.heymimic.peer.infrastructure.persistence;

import com.dev.heymimic.peer.application.PeerInviteRecord;
import com.dev.heymimic.peer.application.PeerParticipantRecord;
import com.dev.heymimic.peer.application.PeerScenarioRecord;
import com.dev.heymimic.peer.application.PeerSessionRecord;
import com.dev.heymimic.peer.application.PeerStore;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcPeerStore implements PeerStore {
  private final JdbcTemplate jdbc;

  public JdbcPeerStore(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public List<PeerScenarioRecord> findScenarios(String category, String level) {
    StringBuilder sql =
        new StringBuilder(
            """
            select id, version, title, category, category_label, level, common_objective,
                   description, duration_minutes, phases::text, recommended_vocab::text
            from peer_scenarios
            where published
            """);
    List<Object> args = new ArrayList<>();
    if (category != null) {
      sql.append(" and category = ?");
      args.add(category);
    }
    if (level != null) {
      sql.append(" and level = ?");
      args.add(level);
    }
    sql.append(" order by category, level, title, id");
    return jdbc.query(sql.toString(), (result, row) -> scenario(result), args.toArray());
  }

  @Override
  public Optional<PeerScenarioRecord> findScenario(UUID id, int version) {
    return jdbc
        .query(
            """
            select id, version, title, category, category_label, level, common_objective,
                   description, duration_minutes, phases::text, recommended_vocab::text
            from peer_scenarios where id = ? and version = ? and published
            """,
            (result, row) -> scenario(result),
            id,
            version)
        .stream()
        .findFirst();
  }

  @Override
  public Optional<PeerSessionRecord> findActive(UUID userId) {
    return jdbc
        .query(
            """
            select session_id from peer_active_reservations reservation
            join peer_sessions session on session.id = reservation.session_id
            where reservation.user_id = ? and session.status in ('WAITING', 'READY', 'ACTIVE')
            """,
            (result, row) -> result.getObject("session_id", UUID.class),
            userId)
        .stream()
        .findFirst()
        .flatMap(this::findById);
  }

  @Override
  public Optional<PeerSessionRecord> findOwned(UUID userId, UUID sessionId) {
    boolean member =
        !jdbc.query(
                "select 1 from peer_participants where session_id = ? and user_id = ?",
                (result, row) -> result.getInt(1),
                sessionId,
                userId)
            .isEmpty();
    return member ? findById(sessionId) : Optional.empty();
  }

  @Override
  public Optional<PeerSessionRecord> lockOwned(UUID userId, UUID sessionId) {
    boolean member =
        !jdbc.query(
                "select 1 from peer_participants where session_id = ? and user_id = ?",
                (result, row) -> result.getInt(1),
                sessionId,
                userId)
            .isEmpty();
    if (!member) return Optional.empty();
    return jdbc
        .query(
            """
            select session.id from peer_sessions session
            where session.id = ? for update
            """,
            (result, row) -> result.getObject("id", UUID.class),
            sessionId)
        .stream()
        .findFirst()
        .flatMap(this::findById);
  }

  @Override
  public Optional<PeerSessionRecord> lockSession(UUID sessionId) {
    return jdbc
        .query(
            "select id from peer_sessions where id = ? for update",
            (result, row) -> result.getObject("id", UUID.class),
            sessionId)
        .stream()
        .findFirst()
        .flatMap(this::findById);
  }

  @Override
  public Optional<PeerInviteRecord> lockInvite(String tokenHash) {
    return jdbc
        .query(
            """
            select id, session_id, token_hash, expires_at, accepted_by, accepted_at, revoked_at
            from peer_invites where token_hash = ? for update
            """,
            (result, row) ->
                new PeerInviteRecord(
                    result.getObject("id", UUID.class),
                    result.getObject("session_id", UUID.class),
                    result.getString("token_hash"),
                    instant(result, "expires_at"),
                    result.getObject("accepted_by", UUID.class),
                    instant(result, "accepted_at"),
                    instant(result, "revoked_at")),
            tokenHash)
        .stream()
        .findFirst();
  }

  @Override
  public PeerSessionRecord createHostSession(
      UUID userId, PeerScenarioRecord scenario, Instant now, Instant expiresAt) {
    UUID sessionId = UUID.randomUUID();
    jdbc.update(
        """
        insert into peer_sessions
          (id, host_user_id, scenario_id, scenario_version, status, version, expires_at, created_at, updated_at)
        values (?, ?, ?, ?, 'WAITING', 0, ?, ?, ?)
        """,
        sessionId,
        userId,
        scenario.id(),
        scenario.version(),
        Timestamp.from(expiresAt),
        Timestamp.from(now),
        Timestamp.from(now));
    jdbc.update(
        """
        insert into peer_participants
          (id, session_id, user_id, slot, role, status, ready, media_connected, joined_at, updated_at)
        values (?, ?, ?, 1, 'HOST', 'JOINING', false, false, ?, ?)
        """,
        UUID.randomUUID(),
        sessionId,
        userId,
        Timestamp.from(now),
        Timestamp.from(now));
    jdbc.update(
        "insert into peer_active_reservations(user_id, session_id, created_at) values (?, ?, ?)",
        userId,
        sessionId,
        Timestamp.from(now));
    return findById(sessionId).orElseThrow();
  }

  @Override
  public PeerInviteRecord createInvite(
      UUID sessionId, String tokenHash, Instant expiresAt, Instant now) {
    UUID inviteId = UUID.randomUUID();
    jdbc.update(
        "insert into peer_invites(id, session_id, token_hash, expires_at, created_at) values (?, ?, ?, ?, ?)",
        inviteId,
        sessionId,
        tokenHash,
        Timestamp.from(expiresAt),
        Timestamp.from(now));
    return new PeerInviteRecord(inviteId, sessionId, tokenHash, expiresAt, null, null, null);
  }

  @Override
  public PeerParticipantRecord addGuest(UUID sessionId, UUID userId, Instant now) {
    UUID participantId = UUID.randomUUID();
    jdbc.update(
        """
        insert into peer_participants
          (id, session_id, user_id, slot, role, status, ready, media_connected, joined_at, updated_at)
        values (?, ?, ?, 2, 'GUEST', 'JOINING', false, false, ?, ?)
        """,
        participantId,
        sessionId,
        userId,
        Timestamp.from(now),
        Timestamp.from(now));
    jdbc.update(
        "insert into peer_active_reservations(user_id, session_id, created_at) values (?, ?, ?)",
        userId,
        sessionId,
        Timestamp.from(now));
    return jdbc
        .query(
            """
            select participant.id, participant.user_id, participant.slot, participant.role,
                   participant.status, participant.ready, participant.media_connected,
                   participant.joined_at, coalesce(profile.name, 'Learner') as display_name
            from peer_participants participant
            left join learner_profiles profile on profile.user_id = participant.user_id
            where participant.id = ?
            """,
            (result, row) -> participant(result),
            participantId)
        .stream()
        .findFirst()
        .orElseThrow();
  }

  @Override
  public boolean updateReady(UUID sessionId, UUID userId, boolean ready) {
    return jdbc.update(
            "update peer_participants set ready = ?, updated_at = now() where session_id = ? and user_id = ?",
            ready,
            sessionId,
            userId)
        == 1;
  }

  @Override
  public boolean updateSessionState(
      UUID sessionId,
      String status,
      Instant startedAt,
      Instant phaseDeadline,
      Instant endedAt,
      String endReason,
      long expectedVersion,
      Instant updatedAt) {
    return jdbc.update(
            """
            update peer_sessions set status = ?, started_at = coalesce(?, started_at),
              phase_deadline = ?, ended_at = ?, end_reason = ?, version = version + 1, updated_at = ?
            where id = ? and version = ?
            """,
            status,
            timestamp(startedAt),
            timestamp(phaseDeadline),
            timestamp(endedAt),
            endReason,
            Timestamp.from(updatedAt),
            sessionId,
            expectedVersion)
        == 1;
  }

  @Override
  public void acceptInvite(UUID inviteId, UUID userId, Instant acceptedAt) {
    jdbc.update(
        "update peer_invites set accepted_by = ?, accepted_at = ? where id = ? and accepted_by is null",
        userId,
        Timestamp.from(acceptedAt),
        inviteId);
  }

  @Override
  public void releaseReservation(UUID userId, UUID sessionId) {
    jdbc.update(
        "delete from peer_active_reservations where user_id = ? and session_id = ?",
        userId,
        sessionId);
  }

  @Override
  public void deleteByUserId(UUID userId) {
    jdbc.update("delete from peer_invites where accepted_by = ?", userId);
    jdbc.update("delete from peer_active_reservations where user_id = ?", userId);
    jdbc.update("delete from peer_participants where user_id = ?", userId);
    jdbc.update("delete from peer_sessions where host_user_id = ?", userId);
  }

  private Optional<PeerSessionRecord> findById(UUID sessionId) {
    return jdbc
        .query(
            """
            select session.id, session.host_user_id, session.status, session.version,
                   session.started_at, session.phase_deadline, session.expires_at, session.ended_at,
                   session.end_reason, scenario.id as scenario_id, scenario.version as scenario_version,
                   scenario.title, scenario.category, scenario.category_label, scenario.level,
                   scenario.common_objective, scenario.description, scenario.duration_minutes,
                   scenario.phases::text, scenario.recommended_vocab::text
            from peer_sessions session
            join peer_scenarios scenario on scenario.id = session.scenario_id
              and scenario.version = session.scenario_version
            where session.id = ?
            """,
            (result, row) -> {
              PeerScenarioRecord scenario =
                  new PeerScenarioRecord(
                      result.getObject("scenario_id", UUID.class),
                      result.getInt("scenario_version"),
                      result.getString("title"),
                      result.getString("category"),
                      result.getString("category_label"),
                      result.getString("level"),
                      result.getString("common_objective"),
                      result.getString("description"),
                      result.getInt("duration_minutes"),
                      result.getString("phases"),
                      result.getString("recommended_vocab"));
              return new PeerSessionRecord(
                  result.getObject("id", UUID.class),
                  result.getObject("host_user_id", UUID.class),
                  scenario,
                  result.getString("status"),
                  result.getLong("version"),
                  instant(result, "started_at"),
                  instant(result, "phase_deadline"),
                  instant(result, "expires_at"),
                  instant(result, "ended_at"),
                  result.getString("end_reason"),
                  participants(sessionId));
            },
            sessionId)
        .stream()
        .findFirst();
  }

  private List<PeerParticipantRecord> participants(UUID sessionId) {
    return jdbc.query(
        """
        select participant.id, participant.user_id, participant.slot, participant.role,
               participant.status, participant.ready, participant.media_connected,
               participant.joined_at, coalesce(profile.name, 'Learner') as display_name
        from peer_participants participant
        left join learner_profiles profile on profile.user_id = participant.user_id
        where participant.session_id = ? order by participant.slot
        """,
        (result, row) -> participant(result),
        sessionId);
  }

  private PeerScenarioRecord scenario(java.sql.ResultSet result) throws java.sql.SQLException {
    return new PeerScenarioRecord(
        result.getObject("id", UUID.class),
        result.getInt("version"),
        result.getString("title"),
        result.getString("category"),
        result.getString("category_label"),
        result.getString("level"),
        result.getString("common_objective"),
        result.getString("description"),
        result.getInt("duration_minutes"),
        result.getString("phases"),
        result.getString("recommended_vocab"));
  }

  private PeerParticipantRecord participant(java.sql.ResultSet result)
      throws java.sql.SQLException {
    return new PeerParticipantRecord(
        result.getObject("id", UUID.class),
        result.getObject("user_id", UUID.class),
        result.getInt("slot"),
        result.getString("role"),
        result.getString("status"),
        result.getBoolean("ready"),
        result.getBoolean("media_connected"),
        instant(result, "joined_at"),
        result.getString("display_name"));
  }

  private static Instant instant(java.sql.ResultSet result, String column)
      throws java.sql.SQLException {
    Timestamp value = result.getTimestamp(column);
    return value == null ? null : value.toInstant();
  }

  private static Timestamp timestamp(Instant value) {
    return value == null ? null : Timestamp.from(value);
  }
}
