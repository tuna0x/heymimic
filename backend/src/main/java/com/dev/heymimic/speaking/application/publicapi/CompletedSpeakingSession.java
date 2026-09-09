package com.dev.heymimic.speaking.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record CompletedSpeakingSession(
    UUID sessionId,
    UUID selectedAttemptId,
    int evaluatedAttempts,
    int acceptedDurationSeconds,
    Instant completedAt,
    boolean replayed) {}
