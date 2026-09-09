package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.vocabulary.application.port.ContextAnalysisRecord;
import com.dev.heymimic.vocabulary.application.port.ContextAnalysisStore;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaContextAnalysisStore implements ContextAnalysisStore {
  private final JpaContextAnalysisRepository repository;

  public JpaContextAnalysisStore(JpaContextAnalysisRepository repository) {
    this.repository = repository;
  }

  @Override
  public void create(
      UUID id,
      UUID userId,
      String inputHash,
      String inputText,
      String targetLanguage,
      UUID jobId,
      UUID quotaReservationId,
      Instant expiresAt,
      Instant now) {
    repository.saveAndFlush(
        new ContextAnalysisEntity(
            id,
            userId,
            inputHash,
            inputText,
            targetLanguage,
            jobId,
            quotaReservationId,
            expiresAt,
            now));
  }

  @Override
  public Optional<ContextAnalysisRecord> findOwned(UUID id, UUID userId) {
    return repository.findByIdAndUserId(id, userId).map(this::record);
  }

  @Override
  public boolean complete(UUID id, UUID userId, String resultJson, Instant now) {
    return repository.complete(id, userId, resultJson, now) == 1;
  }

  @Override
  public boolean fail(UUID id, UUID userId, String errorCode, Instant now) {
    return repository.fail(id, userId, errorCode, now) == 1;
  }

  @Override
  public List<ContextAnalysisRecord> lockExpired(Instant now, int limit) {
    return repository.lockExpired(now, limit).stream().map(this::record).toList();
  }

  @Override
  public void delete(ContextAnalysisRecord analysis) {
    repository.deleteById(analysis.id());
  }

  private ContextAnalysisRecord record(ContextAnalysisEntity analysis) {
    return new ContextAnalysisRecord(
        analysis.id(),
        analysis.userId(),
        analysis.inputText(),
        analysis.targetLanguage(),
        analysis.status(),
        analysis.result(),
        analysis.jobId(),
        analysis.quotaReservationId(),
        analysis.errorCode(),
        analysis.expiresAt());
  }
}
