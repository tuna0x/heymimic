package com.dev.heymimic.peer.application;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PeerStore {
  List<PeerScenarioRecord> findScenarios(String category, String level);

  Optional<PeerScenarioRecord> findScenario(UUID id, int version);

  Optional<PeerSessionRecord> findActive(UUID userId);

  Optional<PeerSessionRecord> findOwned(UUID userId, UUID sessionId);

  Optional<PeerSessionRecord> lockOwned(UUID userId, UUID sessionId);

  Optional<PeerSessionRecord> lockSession(UUID sessionId);

  Optional<PeerInviteRecord> lockInvite(String tokenHash);

  PeerSessionRecord createHostSession(
      UUID userId, PeerScenarioRecord scenario, Instant now, Instant expiresAt);

  PeerParticipantRecord addGuest(UUID sessionId, UUID userId, Instant now);

  PeerInviteRecord createInvite(UUID sessionId, String tokenHash, Instant expiresAt, Instant now);

  boolean updateReady(UUID sessionId, UUID userId, boolean ready);

  boolean updateSessionState(
      UUID sessionId,
      String status,
      Instant startedAt,
      Instant phaseDeadline,
      Instant endedAt,
      String endReason,
      long expectedVersion,
      Instant updatedAt);

  void acceptInvite(UUID inviteId, UUID userId, Instant acceptedAt);

  void releaseReservation(UUID userId, UUID sessionId);

  void deleteByUserId(UUID userId);
}
