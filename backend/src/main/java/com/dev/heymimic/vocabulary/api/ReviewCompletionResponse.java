package com.dev.heymimic.vocabulary.api;

import java.time.Instant;
import java.util.UUID;

public record ReviewCompletionResponse(
    UUID sessionId,
    int totalWords,
    int rememberedWords,
    int needsReviewWords,
    int acceptedDurationSeconds,
    Instant completedAt) {}
