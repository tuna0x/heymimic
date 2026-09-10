package com.dev.heymimic.peer.application;

import com.dev.heymimic.peer.api.PeerInviteView;
import com.dev.heymimic.peer.api.PeerScenarioView;
import com.dev.heymimic.peer.api.PeerSessionView;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PeerPractice {
  List<PeerScenarioView> scenarios(String category, String level);

  PeerSessionView start(UUID userId, UUID idempotencyKey, UUID scenarioVersionId);

  Optional<PeerSessionView> active(UUID userId);

  PeerSessionView get(UUID userId, UUID sessionId);

  PeerInviteView createInvite(UUID userId, UUID idempotencyKey, UUID sessionId);

  PeerSessionView acceptInvite(UUID userId, UUID idempotencyKey, String token);

  PeerSessionView setReady(
      UUID userId, UUID idempotencyKey, UUID sessionId, boolean ready, long expectedVersion);

  PeerSessionView startRoom(UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion);

  PeerSessionView end(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion, String reason);
}
