package com.dev.heymimic.speaking.application.port;

import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.AudioState;
import java.time.Instant;
import java.util.UUID;

public record SpeakingAttemptRecord(
    UUID id,
    UUID sessionId,
    int attemptNumber,
    String objectKey,
    String objectVersion,
    String checksum,
    long sizeBytes,
    String mimeType,
    Long durationMs,
    AudioState audioState,
    AttemptProcessingState processingState,
    Instant uploadExpiresAt,
    Instant retentionUntil,
    long version,
    Instant createdAt) {}
