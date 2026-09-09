package com.dev.heymimic.study.application.publicapi;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record StudySessionView(
    UUID id,
    String status,
    String timezoneSnapshot,
    int currentStep,
    long version,
    Instant startedAt,
    Instant completedAt,
    List<StudyStepView> steps) {}
