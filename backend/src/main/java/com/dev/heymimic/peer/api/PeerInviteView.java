package com.dev.heymimic.peer.api;

import java.time.Instant;
import java.util.UUID;

public record PeerInviteView(UUID sessionId, String token, Instant expiresAt) {}
