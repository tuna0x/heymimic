package com.dev.heymimic.progress.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record MistakePatternView(
    UUID id,
    String category,
    String patternKey,
    String taxonomyVersion,
    String title,
    String explanation,
    String status,
    long occurrenceCount,
    long version,
    Instant firstSeenAt,
    Instant lastSeenAt) {}
