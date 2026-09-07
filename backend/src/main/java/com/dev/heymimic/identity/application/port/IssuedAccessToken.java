package com.dev.heymimic.identity.application.port;

import java.time.Instant;

public record IssuedAccessToken(String value, Instant expiresAt) {}
