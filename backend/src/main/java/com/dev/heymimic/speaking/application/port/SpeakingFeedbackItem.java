package com.dev.heymimic.speaking.application.port;

public record SpeakingFeedbackItem(
    String category, String originalText, String improvedText, String note, String patternKey) {}
