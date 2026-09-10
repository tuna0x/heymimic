package com.dev.heymimic.study.application.port;

import java.time.Instant;
import java.util.UUID;

public record PlanningStateRecord(
    UUID userId,
    long inputVersion,
    long settingsVersion,
    int goalMinutes,
    UUID sourceBriefId,
    Instant dirtySince,
    Instant updatedAt) {}
