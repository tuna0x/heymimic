package com.dev.heymimic.vocabulary.application.port;

import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import java.time.Instant;
import java.util.UUID;

public record VocabularyWordRecord(
    UUID id,
    UUID userId,
    String targetLanguage,
    String normalizedWord,
    String senseKey,
    String word,
    String meaning,
    String pronunciation,
    String partOfSpeech,
    String example,
    String translation,
    String sourceContext,
    int mastery,
    VocabularyStatus status,
    int intervalDays,
    Instant nextReviewAt,
    UUID reviewLockSessionId,
    long version,
    Instant createdAt) {}
