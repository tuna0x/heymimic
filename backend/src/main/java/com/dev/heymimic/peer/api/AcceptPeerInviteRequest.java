package com.dev.heymimic.peer.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcceptPeerInviteRequest(@NotBlank @Size(max = 256) String token) {}
