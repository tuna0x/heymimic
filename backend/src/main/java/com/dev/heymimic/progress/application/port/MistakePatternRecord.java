package com.dev.heymimic.progress.application.port;

import com.dev.heymimic.progress.domain.MistakeStatus;
import java.time.Instant;
import java.util.UUID;

public record MistakePatternRecord(
    UUID id,
    UUID userId,
    String category,
    String patternKey,
    String taxonomyVersion,
    String title,
    String explanation,
    MistakeStatus status,
    long version,
    Instant firstSeenAt,
    Instant lastSeenAt,
    long occurrenceCount) {}
