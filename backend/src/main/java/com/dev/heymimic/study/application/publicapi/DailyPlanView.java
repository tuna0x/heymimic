package com.dev.heymimic.study.application.publicapi;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DailyPlanView(
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
    List<DailyPlanReason> recommendationReasons,
    List<DailyPlanStepView> steps) {}
