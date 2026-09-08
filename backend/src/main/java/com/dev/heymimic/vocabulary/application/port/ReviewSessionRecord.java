package com.dev.heymimic.vocabulary.application.port;

import com.dev.heymimic.vocabulary.domain.ReviewSessionStatus;
import java.time.Instant;
import java.util.UUID;

public record ReviewSessionRecord(
    UUID id,
    UUID userId,
    ReviewSessionStatus status,
    String timezone,
    String schedulerVersion,
    int currentIndex,
    long version,
    Instant startedAt,
    Instant completedAt,
    Instant lastActivityAt) {}
