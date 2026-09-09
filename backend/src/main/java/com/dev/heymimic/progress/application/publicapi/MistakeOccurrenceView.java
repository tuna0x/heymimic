package com.dev.heymimic.progress.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record MistakeOccurrenceView(
    UUID id, UUID evaluationId, String originalText, String suggestedText, Instant occurredAt) {}
