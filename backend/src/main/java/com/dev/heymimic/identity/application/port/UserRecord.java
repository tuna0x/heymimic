package com.dev.heymimic.identity.application.port;

import com.dev.heymimic.identity.domain.UserStatus;
import java.time.Instant;
import java.util.UUID;

public record UserRecord(
    UUID id,
    String emailNormalized,
    String passwordHash,
    UserStatus status,
    Instant verifiedAt,
    long authVersion) {}
