package com.dev.heymimic.progress.application.port;

import com.dev.heymimic.progress.domain.ProgressSourceType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ActivityLedgerEntry(
    UUID eventId,
    UUID userId,
    ProgressSourceType sourceType,
    UUID sourceId,
    LocalDate activityDate,
    String timezoneSnapshot,
    int durationSeconds,
    String ruleVersion,
    Instant occurredAt) {}
