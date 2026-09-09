package com.dev.heymimic.speaking.application.port;

import com.dev.heymimic.speaking.domain.SpeakingEvaluationStage;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus;
import java.time.Instant;
import java.util.UUID;

public record SpeakingEvaluationRecord(
    UUID id,
    UUID attemptId,
    UUID userId,
    SpeakingEvaluationStatus status,
    SpeakingEvaluationStage stage,
    String transcript,
    String resultJson,
    String source,
    UUID jobId,
    UUID quotaReservationId,
    String errorCode,
    boolean retryable,
    boolean providerInvoked,
    long version,
    Instant createdAt,
    Instant updatedAt) {}
