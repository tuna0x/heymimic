package com.dev.heymimic.progress.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record ProjectionRebuildView(
    UUID generationId,
    String ruleVersion,
    long sourceRows,
    long sourceSeconds,
    long projectedDays,
    Instant sourceWatermark,
    Instant activatedAt) {}
