package com.dev.heymimic.speaking.application.port;

public record VerifiedAudioObject(
    String objectVersion,
    String checksumSha256,
    long sizeBytes,
    String detectedMimeType,
    long durationMs) {}
