package com.dev.heymimic.vocabulary.application.port;

public record ReviewSummaryRecord(
    int totalWords, int rememberedWords, int needsReviewWords, int acceptedDurationSeconds) {}
