package com.dev.heymimic.vocabulary.application.port;

import java.time.Instant;
import java.util.UUID;

public record NewVocabularyWord(
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
    Instant now) {}
