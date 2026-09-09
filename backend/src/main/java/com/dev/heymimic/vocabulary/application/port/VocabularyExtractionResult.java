package com.dev.heymimic.vocabulary.application.port;

import com.dev.heymimic.platform.application.publicapi.ProviderUsage;
import java.util.List;

public record VocabularyExtractionResult(
    String source, List<ExtractedVocabularySuggestion> suggestions, ProviderUsage usage) {

  public VocabularyExtractionResult {
    if (usage == null) usage = ProviderUsage.unknown();
  }

  public VocabularyExtractionResult(
      String source, List<ExtractedVocabularySuggestion> suggestions) {
    this(source, suggestions, ProviderUsage.unknown());
  }
}
