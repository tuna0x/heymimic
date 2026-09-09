package com.dev.heymimic.speaking.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record SpeakingEvaluationView(
    UUID id,
    UUID attemptId,
    String status,
    String stage,
    boolean retryable,
    String transcript,
    Object result,
    String source,
    String errorCode,
    Instant createdAt,
    Instant updatedAt) {}
