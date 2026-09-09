package com.dev.heymimic.vocabulary.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record ReviewCompletionView(
    UUID sessionId,
    int totalWords,
    int rememberedWords,
    int needsReviewWords,
    int acceptedDurationSeconds,
    Instant completedAt,
    boolean replayed) {}
