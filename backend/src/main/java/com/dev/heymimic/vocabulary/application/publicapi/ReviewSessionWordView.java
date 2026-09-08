package com.dev.heymimic.vocabulary.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record ReviewSessionWordView(
    UUID id,
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
    long version) {}
