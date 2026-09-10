package com.dev.heymimic.peer.application;

import java.time.Instant;
import java.util.UUID;

public record PeerInviteRecord(
    UUID id,
    UUID sessionId,
    String tokenHash,
    Instant expiresAt,
    UUID acceptedBy,
    Instant acceptedAt,
    Instant revokedAt) {}
