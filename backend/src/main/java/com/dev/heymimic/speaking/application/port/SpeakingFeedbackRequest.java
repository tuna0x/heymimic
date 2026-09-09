package com.dev.heymimic.speaking.application.port;

public record SpeakingFeedbackRequest(
    String transcript, String promptSnapshotJson, long durationMs) {}
