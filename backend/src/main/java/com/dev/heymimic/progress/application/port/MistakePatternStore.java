package com.dev.heymimic.progress.application.port;

import com.dev.heymimic.progress.domain.MistakeStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MistakePatternStore {
  void record(
      UUID userId,
      UUID evaluationId,
      String taxonomyVersion,
      List<MistakeFeedbackItem> items,
      Instant occurredAt);

  MistakePage<MistakePatternRecord> find(
      UUID userId, MistakeStatus status, String category, int page, int size);

  Optional<MistakePatternRecord> findOwned(UUID userId, UUID patternId);

  MistakePage<MistakeOccurrenceRecord> findOccurrences(UUID patternId, int page, int size);

  boolean updateStatus(
      UUID userId, UUID patternId, MistakeStatus status, long expectedVersion, Instant updatedAt);

  void deleteByUserId(UUID userId);
}
