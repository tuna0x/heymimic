package com.dev.heymimic.progress.application.publicapi;

import com.dev.heymimic.progress.domain.MistakeStatus;
import java.time.Instant;
import java.util.UUID;

public record MistakePatternView(
    UUID id,
    String category,
    String patternKey,
    String taxonomyVersion,
    String title,
    String explanation,
    MistakeStatus status,
    String evidenceStage,
    long occurrenceCount,
    long version,
    Instant firstSeenAt,
    Instant lastSeenAt) {}
