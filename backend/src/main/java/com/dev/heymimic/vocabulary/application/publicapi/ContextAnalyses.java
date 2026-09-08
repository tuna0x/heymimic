package com.dev.heymimic.vocabulary.application.publicapi;

import java.util.List;
import java.util.UUID;

public interface ContextAnalyses {
  StartedContextAnalysis start(
      UUID userId, UUID idempotencyKey, String text, String targetLanguage);

  ContextAnalysisView get(UUID userId, UUID analysisId);

  List<VocabularyWordView> save(UUID userId, UUID analysisId, List<UUID> suggestionIds);
}
