package com.dev.heymimic.progress.application.port;

import java.time.Instant;
import java.util.UUID;

public record ProjectionRebuildRecord(
    UUID generationId,
    String ruleVersion,
    long sourceRows,
    long sourceSeconds,
    long projectedDays,
    Instant sourceWatermark,
    Instant activatedAt) {}
