package com.dev.heymimic.vocabulary.api;

import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessionItemView;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReviewSessionResponse(
    UUID id,
    String status,
    String timezone,
    String schedulerVersion,
    int currentIndex,
    long version,
    Instant startedAt,
    Instant completedAt,
    List<ReviewSessionItemView> items) {}
