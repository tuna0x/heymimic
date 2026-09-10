package com.dev.heymimic.vocabulary.application.publicapi;

import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionResult;
import java.util.Optional;
import java.util.UUID;

public interface ContextAnalysisWorkflow {
  String JOB_TYPE = "VOCABULARY_CONTEXT_ANALYSIS";

  boolean isCompleted(UUID analysisId, UUID userId);

  Optional<PreparedContextAnalysis> prepare(UUID analysisId, UUID userId);

  void complete(PreparedContextAnalysis analysis, VocabularyExtractionResult result);

  void fail(UUID analysisId, UUID userId, String errorCode);
}
