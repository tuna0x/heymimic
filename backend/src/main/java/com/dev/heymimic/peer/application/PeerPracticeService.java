package com.dev.heymimic.peer.application;

import com.dev.heymimic.peer.api.PeerInviteView;
import com.dev.heymimic.peer.api.PeerParticipantView;
import com.dev.heymimic.peer.api.PeerPhaseView;
import com.dev.heymimic.peer.api.PeerScenarioView;
import com.dev.heymimic.peer.api.PeerSessionView;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.shared.error.ApiException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class PeerPracticeService implements PeerPractice {
  private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(1);
  private static final Duration SESSION_TTL = Duration.ofMinutes(15);
  private static final Duration INVITE_TTL = Duration.ofMinutes(10);
  private static final Set<String> CATEGORIES =
      Set.of("work", "interview", "tech", "daily", "debate");
  private static final Set<String> LEVELS = Set.of("A2-B1", "B1-B2", "B2+");

  private final PeerStore store;
  private final IdempotencyExecutor idempotency;
  private final ObjectMapper objectMapper;
  private final Clock clock;

  public PeerPracticeService(
      PeerStore store, IdempotencyExecutor idempotency, ObjectMapper objectMapper, Clock clock) {
    this.store = store;
    this.idempotency = idempotency;
    this.objectMapper = objectMapper;
    this.clock = clock;
  }

  @Override
  @Transactional(readOnly = true)
  public List<PeerScenarioView> scenarios(String category, String level) {
    return store
        .findScenarios(
            filter(category, CATEGORIES, "INVALID_PEER_CATEGORY"),
            filter(level, LEVELS, "INVALID_PEER_LEVEL"))
        .stream()
        .map(this::scenarioView)
        .toList();
  }

  @Override
  @Transactional
  public PeerSessionView start(UUID userId, UUID idempotencyKey, UUID scenarioVersionId) {
    var command =
        new IdempotencyCommand(
            userId,
            "peer.session.create",
            idempotencyKey,
            scenarioVersionId.toString(),
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> startFresh(userId, scenarioVersionId));
    return read(result.bodyJson(), PeerSessionView.class);
  }

  private IdempotentResponse startFresh(UUID userId, UUID scenarioId) {
    if (activeSession(userId, clock.instant()).isPresent()) {
      throw conflict("ACTIVE_PEER_SESSION_EXISTS", "You already have an active peer session");
    }
    PeerScenarioRecord scenario =
        store
            .findScenario(scenarioId, 1)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "PEER_SCENARIO_NOT_FOUND",
                        "Peer scenario not found"));
    Instant now = clock.instant();
    try {
      PeerSessionRecord session =
          store.createHostSession(userId, scenario, now, now.plus(SESSION_TTL));
      return IdempotentResponse.fresh(
          HttpStatus.CREATED.value(), write(sessionView(session, now, userId)));
    } catch (DuplicateKeyException duplicate) {
      throw conflict("ACTIVE_PEER_SESSION_EXISTS", "You already have an active peer session");
    }
  }

  @Override
  @Transactional
  public Optional<PeerSessionView> active(UUID userId) {
    Instant now = clock.instant();
    return activeSession(userId, now).map(session -> sessionView(session, now, userId));
  }

  @Override
  @Transactional(readOnly = true)
  public PeerSessionView get(UUID userId, UUID sessionId) {
    return store
        .findOwned(userId, sessionId)
        .map(session -> sessionView(session, clock.instant(), userId))
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND, "PEER_SESSION_NOT_FOUND", "Peer session not found"));
  }

  @Override
  @Transactional
  public PeerInviteView createInvite(UUID userId, UUID idempotencyKey, UUID sessionId) {
    var command =
        new IdempotencyCommand(
            userId, "peer.invite.create", idempotencyKey, sessionId.toString(), IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> createInviteFresh(userId, sessionId));
    return read(result.bodyJson(), PeerInviteView.class);
  }

  private IdempotentResponse createInviteFresh(UUID userId, UUID sessionId) {
    PeerSessionRecord session = ownedSession(userId, sessionId, true);
    if (!session.hostUserId().equals(userId)) {
      throw new ApiException(
          HttpStatus.FORBIDDEN, "PEER_INVITE_HOST_ONLY", "Only the host can create an invite");
    }
    Instant now = clock.instant();
    if (!session.expiresAt().isAfter(now)) {
      activeSession(userId, now);
      throw new ApiException(
          HttpStatus.GONE, "PEER_SESSION_EXPIRED", "This peer session has expired");
    }
    if (!(session.status().equals("WAITING") || session.status().equals("READY"))) {
      throw conflict(
          "PEER_SESSION_NOT_INVITABLE", "This peer session is no longer waiting for a learner");
    }
    Instant expiresAt =
        session.expiresAt().isBefore(now.plus(INVITE_TTL))
            ? session.expiresAt()
            : now.plus(INVITE_TTL);
    String token = UUID.randomUUID().toString();
    store.createInvite(sessionId, tokenHash(token), expiresAt, now);
    return IdempotentResponse.fresh(
        HttpStatus.CREATED.value(), write(new PeerInviteView(sessionId, token, expiresAt)));
  }

  @Override
  @Transactional
  public PeerSessionView acceptInvite(UUID userId, UUID idempotencyKey, String token) {
    var command =
        new IdempotencyCommand(
            userId, "peer.invite.accept", idempotencyKey, tokenHash(token), IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> acceptInviteFresh(userId, token));
    return read(result.bodyJson(), PeerSessionView.class);
  }

  private IdempotentResponse acceptInviteFresh(UUID userId, String token) {
    if (activeSession(userId, clock.instant()).isPresent()) {
      throw conflict("ACTIVE_PEER_SESSION_EXISTS", "You already have an active peer session");
    }
    Instant now = clock.instant();
    PeerInviteRecord invite =
        store
            .lockInvite(tokenHash(token))
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "PEER_INVITE_NOT_FOUND",
                        "Invite not found or expired"));
    if (invite.revokedAt() != null
        || invite.acceptedBy() != null
        || !invite.expiresAt().isAfter(now)) {
      throw new ApiException(
          HttpStatus.GONE, "PEER_INVITE_UNAVAILABLE", "Invite not found or expired");
    }
    PeerSessionRecord session =
        store
            .lockSession(invite.sessionId())
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND, "PEER_SESSION_NOT_FOUND", "Peer session not found"));
    if (!(session.status().equals("WAITING") || session.status().equals("READY"))
        || session.participants().size() >= 2) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "PEER_SESSION_FULL",
          "This peer session cannot accept another learner");
    }
    try {
      store.addGuest(session.id(), userId, now);
      store.acceptInvite(invite.id(), userId, now);
      return IdempotentResponse.fresh(
          HttpStatus.OK.value(),
          write(sessionView(store.findOwned(userId, session.id()).orElseThrow(), now, userId)));
    } catch (DuplicateKeyException duplicate) {
      throw conflict("ACTIVE_PEER_SESSION_EXISTS", "You already have an active peer session");
    }
  }

  @Override
  @Transactional
  public PeerSessionView setReady(
      UUID userId, UUID idempotencyKey, UUID sessionId, boolean ready, long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "peer.session.ready",
            idempotencyKey,
            sessionId + ":" + ready + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(
            command, () -> setReadyFresh(userId, sessionId, ready, expectedVersion));
    return read(result.bodyJson(), PeerSessionView.class);
  }

  private IdempotentResponse setReadyFresh(
      UUID userId, UUID sessionId, boolean ready, long expectedVersion) {
    PeerSessionRecord session = ownedSession(userId, sessionId, true);
    if (!(session.status().equals("WAITING") || session.status().equals("READY"))
        || session.version() != expectedVersion) {
      throw versionConflict();
    }
    if (!store.updateReady(sessionId, userId, ready)) throw versionConflict();
    PeerSessionRecord updated = store.findOwned(userId, sessionId).orElseThrow();
    String status =
        updated.participants().size() == 2
                && updated.participants().stream().allMatch(PeerParticipantRecord::ready)
            ? "READY"
            : "WAITING";
    if (!store.updateSessionState(
        sessionId, status, null, null, null, null, expectedVersion, clock.instant()))
      throw versionConflict();
    return IdempotentResponse.fresh(
        HttpStatus.OK.value(),
        write(
            sessionView(
                store.findOwned(userId, sessionId).orElseThrow(), clock.instant(), userId)));
  }

  @Override
  @Transactional
  public PeerSessionView startRoom(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "peer.session.start",
            idempotencyKey,
            sessionId + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> startRoomFresh(userId, sessionId, expectedVersion));
    return read(result.bodyJson(), PeerSessionView.class);
  }

  private IdempotentResponse startRoomFresh(UUID userId, UUID sessionId, long expectedVersion) {
    PeerSessionRecord session = ownedSession(userId, sessionId, true);
    if (!session.status().equals("READY")
        || session.version() != expectedVersion
        || session.participants().size() != 2
        || session.participants().stream().anyMatch(participant -> !participant.ready())) {
      throw versionConflict();
    }
    Instant now = clock.instant();
    int phaseSeconds =
        scenarioView(session.scenario()).phases().stream()
            .findFirst()
            .map(view -> view.durationSeconds())
            .orElse(90);
    if (!store.updateSessionState(
        sessionId, "ACTIVE", now, now.plusSeconds(phaseSeconds), null, null, expectedVersion, now))
      throw versionConflict();
    return IdempotentResponse.fresh(
        HttpStatus.OK.value(),
        write(sessionView(store.findOwned(userId, sessionId).orElseThrow(), now, userId)));
  }

  @Override
  @Transactional
  public PeerSessionView end(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion, String reason) {
    var command =
        new IdempotencyCommand(
            userId,
            "peer.session.end",
            idempotencyKey,
            sessionId + ":" + expectedVersion + ":" + reason,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> endFresh(userId, sessionId, expectedVersion, reason));
    return read(result.bodyJson(), PeerSessionView.class);
  }

  private IdempotentResponse endFresh(
      UUID userId, UUID sessionId, long expectedVersion, String reason) {
    PeerSessionRecord session = ownedSession(userId, sessionId, true);
    if (session.status().equals("ENDED")
        || session.status().equals("CANCELLED")
        || session.status().equals("EXPIRED")) {
      return IdempotentResponse.fresh(
          HttpStatus.OK.value(), write(sessionView(session, clock.instant(), userId)));
    }
    if (session.version() != expectedVersion) throw versionConflict();
    Instant now = clock.instant();
    if (!store.updateSessionState(
        sessionId,
        "ENDED",
        null,
        null,
        now,
        reason == null || reason.isBlank() ? "USER_ENDED" : reason,
        expectedVersion,
        now)) throw versionConflict();
    session
        .participants()
        .forEach(participant -> store.releaseReservation(participant.userId(), sessionId));
    return IdempotentResponse.fresh(
        HttpStatus.OK.value(),
        write(sessionView(store.findOwned(userId, sessionId).orElseThrow(), now, userId)));
  }

  private Optional<PeerSessionRecord> activeSession(UUID userId, Instant now) {
    Optional<PeerSessionRecord> active = store.findActive(userId);
    if (active.isEmpty() || active.get().expiresAt().isAfter(now)) return active;

    PeerSessionRecord expired = active.get();
    store.updateSessionState(
        expired.id(), "EXPIRED", null, null, now, "TTL_EXPIRED", expired.version(), now);
    expired
        .participants()
        .forEach(participant -> store.releaseReservation(participant.userId(), expired.id()));
    return Optional.empty();
  }

  private PeerSessionRecord ownedSession(UUID userId, UUID sessionId, boolean lock) {
    Optional<PeerSessionRecord> session =
        lock ? store.lockOwned(userId, sessionId) : store.findOwned(userId, sessionId);
    return session.orElseThrow(
        () ->
            new ApiException(
                HttpStatus.NOT_FOUND, "PEER_SESSION_NOT_FOUND", "Peer session not found"));
  }

  private PeerSessionView sessionView(PeerSessionRecord session, Instant serverNow, UUID userId) {
    PeerScenarioView scenario = scenarioView(session.scenario());
    String currentPhase =
        session.status().equals("ACTIVE") && !scenario.phases().isEmpty()
            ? scenario.phases().get(0).phase()
            : null;
    List<PeerParticipantRecord> participants = session.participants();
    PeerParticipantRecord viewer =
        participants.stream()
            .filter(participant -> participant.userId().equals(userId))
            .findFirst()
            .orElse(null);
    return new PeerSessionView(
        session.id(),
        session.status(),
        scenario,
        participants.stream().map(this::participantView).toList(),
        currentPhase,
        serverNow,
        session.phaseDeadline(),
        session.version(),
        session.expiresAt(),
        viewer == null ? null : viewer.id(),
        viewer == null ? null : viewer.role(),
        session.endReason());
  }

  private PeerParticipantView participantView(PeerParticipantRecord participant) {
    return new PeerParticipantView(
        participant.id(),
        participant.slot(),
        participant.role(),
        participant.displayName(),
        participant.status(),
        participant.ready(),
        participant.mediaConnected(),
        participant.joinedAt());
  }

  private PeerScenarioView scenarioView(PeerScenarioRecord scenario) {
    try {
      return new PeerScenarioView(
          scenario.id(),
          scenario.version(),
          scenario.title(),
          scenario.category(),
          scenario.categoryLabel(),
          scenario.level(),
          scenario.commonObjective(),
          scenario.description(),
          scenario.durationMinutes(),
          List.of(objectMapper.readValue(scenario.phasesJson(), PeerPhaseView[].class)),
          List.of(objectMapper.readValue(scenario.recommendedVocabJson(), String[].class)));
    } catch (JacksonException exception) {
      throw new IllegalStateException("Peer scenario content is invalid", exception);
    }
  }

  private String filter(String value, Set<String> allowed, String code) {
    if (value == null || value.isBlank()) return null;
    if (!allowed.contains(value))
      throw new ApiException(HttpStatus.BAD_REQUEST, code, "Peer scenario filter is invalid");
    return value;
  }

  private ApiException versionConflict() {
    return conflict(
        "PEER_SESSION_VERSION_CONFLICT", "Peer session changed; reload it before retrying");
  }

  private ApiException conflict(String code, String message) {
    return new ApiException(HttpStatus.CONFLICT, code, message);
  }

  private String tokenHash(String token) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is not available", exception);
    }
  }

  private String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize peer response", exception);
    }
  }

  private <T> T read(String value, Class<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize peer response", exception);
    }
  }
}
