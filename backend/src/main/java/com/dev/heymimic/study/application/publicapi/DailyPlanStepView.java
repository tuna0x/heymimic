package com.dev.heymimic.study.application.publicapi;

import java.util.List;
import java.util.UUID;

public record DailyPlanStepView(
    UUID id,
    int position,
    String kind,
    String practiceMode,
    List<UUID> targetRefs,
    int estimatedSeconds,
    String preparationStatus,
    UUID briefId) {}
