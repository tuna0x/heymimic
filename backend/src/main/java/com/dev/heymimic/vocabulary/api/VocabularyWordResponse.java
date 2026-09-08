package com.dev.heymimic.vocabulary.api;

import java.time.Instant;
import java.util.UUID;

public record VocabularyWordResponse(
    UUID id,
    String targetLanguage,
    String word,
    String meaning,
    String pronunciation,
    String partOfSpeech,
    String example,
    String translation,
    String sourceContext,
    int mastery,
    String status,
    int intervalDays,
    Instant nextReviewAt,
    long version,
    Instant createdAt) {}
