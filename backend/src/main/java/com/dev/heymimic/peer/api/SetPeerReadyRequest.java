package com.dev.heymimic.peer.api;

import jakarta.validation.constraints.Min;

public record SetPeerReadyRequest(boolean ready, @Min(0) long expectedVersion) {}
