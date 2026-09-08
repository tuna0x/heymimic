package com.dev.heymimic.speaking.application.port;

public record SpeakingTranscriptionResult(
    String source, String transcript, String provider, String model) {}
