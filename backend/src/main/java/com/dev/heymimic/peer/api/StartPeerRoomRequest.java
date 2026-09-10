package com.dev.heymimic.peer.api;

import jakarta.validation.constraints.Min;

public record StartPeerRoomRequest(@Min(0) long expectedVersion) {}
