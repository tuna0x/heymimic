package com.dev.heymimic.peer.application;

import java.time.Instant;
import java.util.UUID;

public record PeerParticipantRecord(
    UUID id,
    UUID userId,
    int slot,
    String role,
    String status,
    boolean ready,
    boolean mediaConnected,
    Instant joinedAt,
    String displayName) {}
