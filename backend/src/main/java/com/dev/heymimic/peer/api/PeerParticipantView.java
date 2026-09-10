package com.dev.heymimic.peer.api;

import java.time.Instant;
import java.util.UUID;

public record PeerParticipantView(
    UUID id,
    int slot,
    String role,
    String displayName,
    String status,
    boolean ready,
    boolean mediaConnected,
    Instant joinedAt) {}
