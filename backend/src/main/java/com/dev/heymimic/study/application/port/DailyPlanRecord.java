package com.dev.heymimic.study.application.port;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DailyPlanRecord(
    UUID id,
    UUID userId,
    LocalDate localDate,
    String timezoneSnapshot,
    int goalMinutes,
    long planVersion,
    String state,
    long inputVersion,
    long settingsVersion,
    Instant validUntil,
    String catalogVersion,
    String plannerVersion,
    String inputSnapshotJson,
    String recommendationReasonsJson,
    List<DailyPlanStepRecord> steps) {}
