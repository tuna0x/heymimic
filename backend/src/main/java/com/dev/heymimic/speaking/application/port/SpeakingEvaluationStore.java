package com.dev.heymimic.speaking.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpeakingEvaluationStore {
  void create(
      UUID id, UUID attemptId, UUID userId, UUID jobId, UUID quotaReservationId, Instant now);

  Optional<SpeakingEvaluationRecord> findOwned(UUID id, UUID userId);

  Optional<SpeakingEvaluationRecord> findByAttemptOwned(UUID attemptId, UUID userId);

  List<SpeakingEvaluationRecord> findByAttemptIdsOwned(List<UUID> attemptIds, UUID userId);

  boolean begin(UUID id, UUID userId, Instant now);

  boolean saveTranscript(UUID id, UUID userId, String transcript, Instant now);

  boolean complete(UUID id, UUID userId, String resultJson, String source, Instant now);

  boolean failFinal(UUID id, UUID userId, String errorCode, Instant now);

  void deleteByUserId(UUID userId);
}
