package com.dev.heymimic.speaking.application.publicapi;

import com.dev.heymimic.speaking.domain.SpeakingEvaluationStage;
import java.util.UUID;

public record PreparedSpeakingEvaluation(
    UUID id,
    UUID userId,
    UUID attemptId,
    UUID sessionId,
    String objectKey,
    String objectVersion,
    String mimeType,
    long durationMs,
    String promptSnapshotJson,
    SpeakingEvaluationStage stage,
    String transcript,
    UUID quotaReservationId) {}
