package com.dev.heymimic.speaking.application.publicapi;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SpeakingSessionView(
    UUID id,
    String status,
    String timezoneSnapshot,
    SpeakingTopicView topic,
    UUID selectedAttemptId,
    List<SpeakingAttemptDetailView> attempts,
    long version,
    Instant startedAt,
    Instant completedAt) {}
