package com.dev.heymimic.vocabulary.application.publicapi;

import java.util.UUID;

public record VocabularySuggestionView(
    UUID id,
    String word,
    String meaning,
    String pronunciation,
    String partOfSpeech,
    String example,
    String translation,
    String sourceSentence,
    UUID existingWordId) {}
