package com.dev.heymimic.identity.application.port;

import com.dev.heymimic.identity.domain.EmailTokenPurpose;
import java.time.Instant;
import java.util.UUID;

public record EmailTokenRecord(
    UUID id, UUID userId, EmailTokenPurpose purpose, Instant expiresAt, Instant consumedAt) {}
