package com.dev.heymimic.identity.api;

import java.util.UUID;

public record RegisterResponse(UUID userId, boolean verificationRequired) {}
