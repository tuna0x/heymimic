package com.dev.heymimic.peer.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PeerSessionView(
    UUID id,
    String status,
    PeerScenarioView scenario,
    List<PeerParticipantView> participants,
    String currentPhase,
    Instant serverNow,
    Instant phaseDeadline,
    long version,
    Instant expiresAt,
    UUID viewerParticipantId,
    String viewerRole,
    String endReason) {}
