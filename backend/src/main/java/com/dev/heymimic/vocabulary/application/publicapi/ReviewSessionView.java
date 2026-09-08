package com.dev.heymimic.vocabulary.application.publicapi;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReviewSessionView(
    UUID id,
    String status,
    String timezone,
    String schedulerVersion,
    int currentIndex,
    long version,
    Instant startedAt,
    Instant completedAt,
    List<ReviewSessionItemView> items) {}
