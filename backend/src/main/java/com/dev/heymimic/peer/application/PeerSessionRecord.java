package com.dev.heymimic.peer.application;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PeerSessionRecord(
    UUID id,
    UUID hostUserId,
    PeerScenarioRecord scenario,
    String status,
    long version,
    Instant startedAt,
    Instant phaseDeadline,
    Instant expiresAt,
    Instant endedAt,
    String endReason,
    List<PeerParticipantRecord> participants) {}
