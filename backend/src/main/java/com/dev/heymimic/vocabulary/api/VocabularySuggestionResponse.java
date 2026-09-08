package com.dev.heymimic.vocabulary.api;

import java.util.UUID;

public record VocabularySuggestionResponse(
    UUID id,
    String word,
    String meaning,
    String pronunciation,
    String partOfSpeech,
    String example,
    String translation,
    String sourceSentence,
    UUID existingWordId) {}
