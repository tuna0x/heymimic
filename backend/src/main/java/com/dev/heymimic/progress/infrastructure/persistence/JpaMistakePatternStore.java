package com.dev.heymimic.progress.infrastructure.persistence;

import com.dev.heymimic.progress.application.port.MistakeFeedbackItem;
import com.dev.heymimic.progress.application.port.MistakeOccurrenceRecord;
import com.dev.heymimic.progress.application.port.MistakePage;
import com.dev.heymimic.progress.application.port.MistakePatternRecord;
import com.dev.heymimic.progress.application.port.MistakePatternStore;
import com.dev.heymimic.progress.domain.MistakeStatus;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JpaMistakePatternStore implements MistakePatternStore {
  private final JpaMistakePatternRepository patterns;
  private final JpaMistakeOccurrenceRepository occurrences;
  private final Clock clock;

  public JpaMistakePatternStore(
      JpaMistakePatternRepository patterns,
      JpaMistakeOccurrenceRepository occurrences,
      Clock clock) {
    this.patterns = patterns;
    this.occurrences = occurrences;
    this.clock = clock;
  }

  @Override
  @Transactional
  public void record(
      UUID userId,
      UUID evaluationId,
      String taxonomyVersion,
      List<MistakeFeedbackItem> items,
      Instant occurredAt) {
    for (MistakeFeedbackItem item : items) {
      patterns.insertIfAbsent(
          UUID.randomUUID(),
          userId,
          item.category(),
          item.patternKey(),
          taxonomyVersion,
          item.title(),
          item.explanation(),
          occurredAt);
      MistakePatternEntity pattern =
          patterns
              .findByUserIdAndCategoryAndPatternKeyAndTaxonomyVersion(
                  userId, item.category(), item.patternKey(), taxonomyVersion)
              .orElseThrow();
      if (occurrences.insertIfAbsent(
              UUID.randomUUID(),
              pattern.id(),
              evaluationId,
              item.feedbackItemId(),
              item.originalText(),
              item.suggestedText(),
              occurredAt,
              clock.instant())
          == 1) {
        patterns.advanceLastSeen(pattern.id(), occurredAt);
      }
    }
  }

  @Override
  public MistakePage<MistakePatternRecord> find(
      UUID userId, MistakeStatus status, String category, int page, int size) {
    var result = patterns.findOwned(userId, status, category, PageRequest.of(page, size));
    return new MistakePage<>(
        result.stream().map(this::record).toList(),
        page,
        size,
        result.getTotalElements(),
        result.getTotalPages());
  }

  @Override
  public Optional<MistakePatternRecord> findOwned(UUID userId, UUID patternId) {
    return patterns.findByIdAndUserId(patternId, userId).map(this::record);
  }

  @Override
  public MistakePage<MistakeOccurrenceRecord> findOccurrences(UUID patternId, int page, int size) {
    var result =
        occurrences.findByPatternIdOrderByOccurredAtDesc(patternId, PageRequest.of(page, size));
    return new MistakePage<>(
        result.stream().map(this::occurrence).toList(),
        page,
        size,
        result.getTotalElements(),
        result.getTotalPages());
  }

  @Override
  @Transactional
  public boolean updateStatus(
      UUID userId, UUID patternId, MistakeStatus status, long expectedVersion, Instant updatedAt) {
    return patterns.updateStatus(patternId, userId, status, expectedVersion, updatedAt) == 1;
  }

  @Override
  @Transactional
  public void deleteByUserId(UUID userId) {
    patterns.deleteByUserId(userId);
    patterns.flush();
  }

  private MistakePatternRecord record(MistakePatternEntity pattern) {
    return new MistakePatternRecord(
        pattern.id(),
        pattern.userId(),
        pattern.category(),
        pattern.patternKey(),
        pattern.taxonomyVersion(),
        pattern.title(),
        pattern.explanation(),
        pattern.status(),
        pattern.version(),
        pattern.firstSeenAt(),
        pattern.lastSeenAt(),
        occurrences.countByPatternId(pattern.id()));
  }

  private MistakeOccurrenceRecord occurrence(MistakeOccurrenceEntity occurrence) {
    return new MistakeOccurrenceRecord(
        occurrence.id(),
        occurrence.evaluationId(),
        occurrence.feedbackItemId(),
        occurrence.originalText(),
        occurrence.suggestedText(),
        occurrence.occurredAt());
  }
}
