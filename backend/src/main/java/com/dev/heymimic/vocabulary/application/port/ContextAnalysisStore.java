package com.dev.heymimic.vocabulary.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContextAnalysisStore {
  void create(
      UUID id,
      UUID userId,
      String inputHash,
      String inputText,
      String targetLanguage,
      UUID jobId,
      UUID quotaReservationId,
      Instant expiresAt,
      Instant now);

  Optional<ContextAnalysisRecord> findOwned(UUID id, UUID userId);

  boolean complete(UUID id, UUID userId, String resultJson, Instant now);

  boolean fail(UUID id, UUID userId, String errorCode, Instant now);

  List<ContextAnalysisRecord> lockExpired(Instant now, int limit);

  void delete(ContextAnalysisRecord analysis);
}
