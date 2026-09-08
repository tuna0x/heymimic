package com.dev.heymimic.speaking.application.port;

public record SpeakingTranscriptionRequest(
    String objectKey, String objectVersion, String mimeType, long durationMs) {}
