package com.dev.heymimic.progress.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaMistakeOccurrenceRepository extends JpaRepository<MistakeOccurrenceEntity, UUID> {
  @Modifying
  @Query(
      value =
          """
      insert into progress_mistake_occurrences
        (id, pattern_id, evaluation_id, feedback_item_id, original_text,
         suggested_text, occurred_at, created_at)
      values
        (:id, :patternId, :evaluationId, :feedbackItemId, :originalText,
         :suggestedText, :occurredAt, :createdAt)
      on conflict (feedback_item_id) do nothing
      """,
      nativeQuery = true)
  int insertIfAbsent(
      @Param("id") UUID id,
      @Param("patternId") UUID patternId,
      @Param("evaluationId") UUID evaluationId,
      @Param("feedbackItemId") UUID feedbackItemId,
      @Param("originalText") String originalText,
      @Param("suggestedText") String suggestedText,
      @Param("occurredAt") Instant occurredAt,
      @Param("createdAt") Instant createdAt);

  Page<MistakeOccurrenceEntity> findByPatternIdOrderByOccurredAtDesc(
      UUID patternId, Pageable pageable);

  long countByPatternId(UUID patternId);
}
