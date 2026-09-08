package com.dev.heymimic.progress.application.port;

import java.time.Instant;
import java.util.UUID;

public record MistakeOccurrenceRecord(
    UUID id,
    UUID evaluationId,
    UUID feedbackItemId,
    String originalText,
    String suggestedText,
    Instant occurredAt) {}
