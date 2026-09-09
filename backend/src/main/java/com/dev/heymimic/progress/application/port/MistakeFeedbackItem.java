package com.dev.heymimic.progress.application.port;

import java.util.UUID;

public record MistakeFeedbackItem(
    UUID feedbackItemId,
    String category,
    String patternKey,
    String title,
    String explanation,
    String originalText,
    String suggestedText) {}
