package com.dev.heymimic.study.application.port;

import java.time.Instant;
import java.util.UUID;

public record DailyPlanRefreshCandidate(
    UUID userId,
    UUID planId,
    long contextRevision,
    int goalMinutes,
    UUID sourceBriefId,
    Instant validUntil) {}
