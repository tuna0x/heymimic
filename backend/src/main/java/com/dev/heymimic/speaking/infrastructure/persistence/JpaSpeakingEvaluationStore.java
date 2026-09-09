package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.speaking.application.port.SpeakingEvaluationRecord;
import com.dev.heymimic.speaking.application.port.SpeakingEvaluationStore;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaSpeakingEvaluationStore implements SpeakingEvaluationStore {
  private final JpaSpeakingEvaluationRepository repository;

  public JpaSpeakingEvaluationStore(JpaSpeakingEvaluationRepository repository) {
    this.repository = repository;
  }

  @Override
  public void create(
      UUID id, UUID attemptId, UUID userId, UUID jobId, UUID quotaReservationId, Instant now) {
    repository.saveAndFlush(
        new SpeakingEvaluationEntity(id, attemptId, userId, jobId, quotaReservationId, now));
  }

  @Override
  public Optional<SpeakingEvaluationRecord> findOwned(UUID id, UUID userId) {
    return repository.findByIdAndUserId(id, userId).map(this::record);
  }

  @Override
  public Optional<SpeakingEvaluationRecord> findByAttemptOwned(UUID attemptId, UUID userId) {
    return repository.findByAttemptIdAndUserId(attemptId, userId).map(this::record);
  }

  @Override
  public List<SpeakingEvaluationRecord> findByAttemptIdsOwned(List<UUID> attemptIds, UUID userId) {
    if (attemptIds.isEmpty()) return List.of();
    return repository.findByUserIdAndAttemptIdIn(userId, attemptIds).stream()
        .map(this::record)
        .toList();
  }

  @Override
  public boolean begin(UUID id, UUID userId, Instant now) {
    return repository.begin(id, userId, now) == 1;
  }

  @Override
  public boolean saveTranscript(UUID id, UUID userId, String transcript, Instant now) {
    return repository.saveTranscript(id, userId, transcript, now) == 1;
  }

  @Override
  public boolean complete(UUID id, UUID userId, String resultJson, String source, Instant now) {
    return repository.complete(id, userId, resultJson, source, now) == 1;
  }

  @Override
  public boolean failFinal(UUID id, UUID userId, String errorCode, Instant now) {
    return repository.failFinal(id, userId, errorCode, now) == 1;
  }

  @Override
  public void deleteByUserId(UUID userId) {
    repository.deleteFeedbackByUserId(userId);
    repository.deleteByUserId(userId);
    repository.flush();
  }

  private SpeakingEvaluationRecord record(SpeakingEvaluationEntity evaluation) {
    return new SpeakingEvaluationRecord(
        evaluation.id(),
        evaluation.attemptId(),
        evaluation.userId(),
        evaluation.status(),
        evaluation.stage(),
        evaluation.transcript(),
        evaluation.result(),
        evaluation.source(),
        evaluation.jobId(),
        evaluation.quotaReservationId(),
        evaluation.errorCode(),
        evaluation.retryable(),
        evaluation.providerInvoked(),
        evaluation.version(),
        evaluation.createdAt(),
        evaluation.updatedAt());
  }
}
