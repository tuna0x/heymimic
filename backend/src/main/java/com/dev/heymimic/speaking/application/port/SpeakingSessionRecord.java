package com.dev.heymimic.speaking.application.port;

import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Instant;
import java.util.UUID;

public record SpeakingSessionRecord(
    UUID id,
    UUID userId,
    UUID topicId,
    int topicRevision,
    String promptSnapshotJson,
    String timezoneSnapshot,
    SpeakingSessionStatus status,
    UUID selectedAttemptId,
    long version,
    Instant startedAt,
    Instant completedAt) {}
