package com.dev.heymimic.vocabulary.application.port;

public interface VocabularyExtractionPort {
  VocabularyExtractionResult extract(String text, String targetLanguage);
}
