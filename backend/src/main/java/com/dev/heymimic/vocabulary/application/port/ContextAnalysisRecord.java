package com.dev.heymimic.vocabulary.application.port;

import com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus;
import java.time.Instant;
import java.util.UUID;

public record ContextAnalysisRecord(
    UUID id,
    UUID userId,
    String inputText,
    String targetLanguage,
    ContextAnalysisStatus status,
    String resultJson,
    UUID jobId,
    UUID quotaReservationId,
    String errorCode,
    Instant expiresAt) {}
