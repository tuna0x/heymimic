package com.dev.heymimic.speaking.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpeakingAttemptStore {
  int nextAttemptNumber(UUID sessionId);

  void create(
      UUID id,
      UUID sessionId,
      int attemptNumber,
      String objectKey,
      String mimeType,
      long sizeBytes,
      Instant uploadExpiresAt,
      Instant now);

  Optional<SpeakingAttemptRecord> findOwned(UUID id, UUID userId);

  Optional<SpeakingAttemptRecord> lockOwned(UUID id, UUID userId);

  List<SpeakingAttemptRecord> findBySessionOwned(UUID sessionId, UUID userId);

  boolean renewUpload(UUID id, UUID userId, long expectedVersion, Instant expiresAt, Instant now);

  boolean seal(
      UUID id,
      UUID userId,
      long expectedVersion,
      VerifiedAudioObject verified,
      Instant retentionUntil,
      Instant now);

  List<SpeakingAttemptRecord> findExpiredAudio(Instant now, int batchSize);

  boolean markAudioDeleted(UUID id, long expectedVersion, Instant now);

  boolean queueEvaluation(UUID id, UUID userId, long expectedVersion, Instant now);

  boolean failEvaluation(UUID id, UUID userId, Instant now);

  boolean beginEvaluation(UUID id, UUID userId, Instant now);

  boolean completeEvaluation(UUID id, UUID userId, Instant now);

  void deleteByUserId(UUID userId);
}
