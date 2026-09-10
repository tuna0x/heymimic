package com.dev.heymimic.study.application.port;

import java.util.UUID;

public record DailyPlanStepRecord(
    UUID id,
    int position,
    String kind,
    String practiceMode,
    String targetRefsJson,
    int estimatedSeconds,
    String preparationStatus,
    UUID briefId) {}
