package com.dev.heymimic.study.application.port;

import com.dev.heymimic.study.domain.StudySessionStatus;
import java.time.Instant;
import java.util.UUID;

public record StudySessionRecord(
    UUID id,
    UUID userId,
    StudySessionStatus status,
    String timezoneSnapshot,
    int currentStep,
    long version,
    Instant startedAt,
    Instant completedAt) {}
