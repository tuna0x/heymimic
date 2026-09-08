package com.dev.heymimic.speaking.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record SpeakingAttemptView(
    UUID id,
    UUID sessionId,
    int attemptNumber,
    String mimeType,
    long sizeBytes,
    Long durationMs,
    String audioState,
    String processingState,
    long version,
    Instant createdAt) {}
