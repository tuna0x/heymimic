package com.dev.heymimic.vocabulary.application.port;

import java.util.List;

public record VocabularyExtractionResult(
    String source, List<ExtractedVocabularySuggestion> suggestions) {}
