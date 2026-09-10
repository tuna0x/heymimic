package com.dev.heymimic.peer.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record EndPeerSessionRequest(
    @Min(0) long expectedVersion, @Size(max = 64) String endReason) {}
