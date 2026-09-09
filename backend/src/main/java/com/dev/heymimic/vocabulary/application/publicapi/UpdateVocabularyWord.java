package com.dev.heymimic.vocabulary.application.publicapi;

public record UpdateVocabularyWord(
    String meaning, String example, String sourceContext, long expectedVersion) {}
