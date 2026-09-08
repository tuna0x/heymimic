package com.dev.heymimic.vocabulary.application.port;

import com.dev.heymimic.vocabulary.domain.ReviewRating;
import java.time.Instant;
import java.util.UUID;

public record ReviewEventRecord(
    UUID id,
    UUID sessionId,
    UUID itemId,
    UUID wordId,
    ReviewRating rating,
    String beforeStateJson,
    String afterStateJson,
    int durationSeconds,
    Instant reviewedAt,
    Instant undoneAt) {}
