package com.dev.heymimic.vocabulary.application.port;

public record ExtractedVocabularySuggestion(
    String word,
    String meaning,
    String pronunciation,
    String partOfSpeech,
    String example,
    String translation,
    String sourceSentence) {}
