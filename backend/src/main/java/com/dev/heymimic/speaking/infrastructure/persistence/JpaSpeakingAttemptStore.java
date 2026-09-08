package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.application.port.VerifiedAudioObject;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

@Repository
public class JpaSpeakingAttemptStore implements SpeakingAttemptStore {
  private final JpaSpeakingAttemptRepository repository;

  public JpaSpeakingAttemptStore(JpaSpeakingAttemptRepository repository) {
    this.repository = repository;
  }

  @Override
  public int nextAttemptNumber(UUID sessionId) {
    return repository.nextAttemptNumber(sessionId);
  }

  @Override
  public void create(
      UUID id,
      UUID sessionId,
      int attemptNumber,
      String objectKey,
      String mimeType,
      long sizeBytes,
      Instant uploadExpiresAt,
      Instant now) {
    repository.saveAndFlush(
        new SpeakingAttemptEntity(
            id, sessionId, attemptNumber, objectKey, mimeType, sizeBytes, uploadExpiresAt, now));
  }

  @Override
  public Optional<SpeakingAttemptRecord> findOwned(UUID id, UUID userId) {
    return repository.findOwned(id, userId).map(this::record);
  }

  @Override
  public Optional<SpeakingAttemptRecord> lockOwned(UUID id, UUID userId) {
    return repository.lockOwned(id, userId).map(this::record);
  }

  @Override
  public List<SpeakingAttemptRecord> findBySessionOwned(UUID sessionId, UUID userId) {
    return repository.findBySessionOwned(sessionId, userId).stream().map(this::record).toList();
  }

  @Override
  public boolean renewUpload(
      UUID id, UUID userId, long expectedVersion, Instant expiresAt, Instant now) {
    return repository.renewUpload(id, userId, expectedVersion, expiresAt, now) == 1;
  }

  @Override
  public boolean seal(
      UUID id,
      UUID userId,
      long expectedVersion,
      VerifiedAudioObject verified,
      Instant retentionUntil,
      Instant now) {
    return repository.seal(
            id,
            userId,
            expectedVersion,
            verified.objectVersion(),
            verified.checksumSha256(),
            verified.sizeBytes(),
            verified.detectedMimeType(),
            verified.durationMs(),
            retentionUntil,
            now)
        == 1;
  }

  @Override
  public List<SpeakingAttemptRecord> findExpiredAudio(Instant now, int batchSize) {
    return repository.findExpiredAudio(now, PageRequest.of(0, batchSize)).stream()
        .map(this::record)
        .toList();
  }

  @Override
  public boolean markAudioDeleted(UUID id, long expectedVersion, Instant now) {
    return repository.markAudioDeleted(id, expectedVersion, now) == 1;
  }

  @Override
  public boolean queueEvaluation(UUID id, UUID userId, long expectedVersion, Instant now) {
    return repository.queueEvaluation(id, userId, expectedVersion, now) == 1;
  }

  @Override
  public boolean failEvaluation(UUID id, UUID userId, Instant now) {
    return repository.failEvaluation(id, userId, now) == 1;
  }

  @Override
  public boolean beginEvaluation(UUID id, UUID userId, Instant now) {
    return repository.beginEvaluation(id, userId, now) == 1;
  }

  @Override
  public boolean completeEvaluation(UUID id, UUID userId, Instant now) {
    return repository.completeEvaluation(id, userId, now) == 1;
  }

  @Override
  public void deleteByUserId(UUID userId) {
    repository.deleteByOwner(userId);
    repository.flush();
  }

  private SpeakingAttemptRecord record(SpeakingAttemptEntity attempt) {
    return new SpeakingAttemptRecord(
        attempt.id(),
        attempt.sessionId(),
        attempt.attemptNumber(),
        attempt.objectKey(),
        attempt.objectVersion(),
        attempt.checksum(),
        attempt.sizeBytes(),
        attempt.mimeType(),
        attempt.durationMs(),
        attempt.audioState(),
        attempt.processingState(),
        attempt.uploadExpiresAt(),
        attempt.retentionUntil(),
        attempt.version(),
        attempt.createdAt());
  }
}
