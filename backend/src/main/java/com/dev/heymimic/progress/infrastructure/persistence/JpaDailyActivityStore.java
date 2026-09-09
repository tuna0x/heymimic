package com.dev.heymimic.progress.infrastructure.persistence;

import com.dev.heymimic.progress.application.port.DailyActivityRecord;
import com.dev.heymimic.progress.application.port.DailyActivityStore;
import com.dev.heymimic.progress.application.port.DailyProjectionRebuilder;
import com.dev.heymimic.progress.application.port.ProjectionRebuildRecord;
import com.dev.heymimic.progress.domain.ProgressSourceType;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@Repository
public class JpaDailyActivityStore implements DailyActivityStore, DailyProjectionRebuilder {
  private final JpaDailyActivityRepository repository;
  private final JpaProjectionStateRepository state;
  private final JpaProjectionGenerationRepository generations;
  private final JpaProjectionSourceRepository source;
  private final TransactionTemplate transactions;
  private final Clock clock;

  public JpaDailyActivityStore(
      JpaDailyActivityRepository repository,
      JpaProjectionStateRepository state,
      JpaProjectionGenerationRepository generations,
      JpaProjectionSourceRepository source,
      TransactionTemplate transactions,
      Clock clock) {
    this.repository = repository;
    this.state = state;
    this.generations = generations;
    this.source = source;
    this.transactions = transactions;
    this.clock = clock;
  }

  @Override
  @Transactional
  public void add(
      UUID userId,
      LocalDate activityDate,
      ProgressSourceType sourceType,
      int durationSeconds,
      String timezoneSnapshot,
      Instant projectedThrough) {
    int vocabularySeconds =
        sourceType == ProgressSourceType.VOCABULARY_REVIEW ? durationSeconds : 0;
    int speakingSeconds = sourceType == ProgressSourceType.SPEAKING_SESSION ? durationSeconds : 0;
    repository.add(
        state.lockShared().activeGenerationId(),
        userId,
        activityDate,
        vocabularySeconds,
        speakingSeconds,
        timezoneSnapshot,
        projectedThrough,
        clock.instant());
  }

  @Override
  public List<DailyActivityRecord> find(UUID userId, LocalDate from, LocalDate to) {
    return repository
        .findByGenerationIdAndUserIdAndActivityDateBetweenOrderByActivityDate(
            state.activeGenerationId(), userId, from, to)
        .stream()
        .map(this::record)
        .toList();
  }

  @Override
  public List<DailyActivityRecord> findAll(UUID userId) {
    return repository
        .findByGenerationIdAndUserIdOrderByActivityDate(state.activeGenerationId(), userId)
        .stream()
        .map(this::record)
        .toList();
  }

  @Override
  public Instant projectedThrough(UUID userId) {
    return repository.projectedThrough(state.activeGenerationId(), userId);
  }

  @Override
  @Transactional
  public void deleteByUserId(UUID userId) {
    repository.deleteByUserId(userId);
    repository.flush();
  }

  @Override
  public ProjectionRebuildRecord rebuild(String ruleVersion) {
    UUID generationId = UUID.randomUUID();
    Instant createdAt = clock.instant();
    transactions.executeWithoutResult(
        ignored -> {
          generations.saveAndFlush(
              new ProjectionGenerationEntity(generationId, ruleVersion, createdAt));
          repository.populateFromLedger(generationId, createdAt);
        });
    try {
      return transactions.execute(ignored -> activateRebuild(generationId, ruleVersion));
    } catch (RuntimeException exception) {
      transactions.executeWithoutResult(ignored -> generations.fail(generationId));
      throw exception;
    }
  }

  private ProjectionRebuildRecord activateRebuild(UUID generationId, String ruleVersion) {
    state.lockExclusive();
    Instant activatedAt = clock.instant();
    repository.deleteGeneration(generationId);
    repository.populateFromLedger(generationId, activatedAt);
    var stats = source.sourceStats();
    long projectedSeconds = repository.sumSeconds(generationId);
    if (stats.getSourceSeconds() != projectedSeconds) {
      throw new IllegalStateException("Daily projection rebuild totals do not match the ledger");
    }
    generations.retireActive();
    if (generations.activate(
            generationId,
            stats.getSourceWatermark(),
            stats.getSourceRows(),
            stats.getSourceSeconds(),
            activatedAt)
        != 1) {
      throw new IllegalStateException("Daily projection generation is no longer buildable");
    }
    state.activate(generationId, activatedAt);
    return new ProjectionRebuildRecord(
        generationId,
        ruleVersion,
        stats.getSourceRows(),
        stats.getSourceSeconds(),
        repository.countDays(generationId),
        stats.getSourceWatermark(),
        activatedAt);
  }

  private DailyActivityRecord record(DailyActivityEntity entity) {
    return new DailyActivityRecord(
        entity.activityDate(),
        entity.vocabularySeconds(),
        entity.speakingSeconds(),
        entity.qualifiesForStreak(),
        entity.timezoneSnapshot(),
        entity.projectedThrough());
  }
}
