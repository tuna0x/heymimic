package com.dev.heymimic.progress.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "progress_mistake_occurrences")
class MistakeOccurrenceEntity {
  @Id private UUID id;

  @Column(name = "pattern_id", nullable = false)
  private UUID patternId;

  @Column(name = "evaluation_id", nullable = false)
  private UUID evaluationId;

  @Column(name = "feedback_item_id", nullable = false, unique = true)
  private UUID feedbackItemId;

  @Column(name = "original_text", length = 2000)
  private String originalText;

  @Column(name = "suggested_text", length = 2000)
  private String suggestedText;

  @Column(name = "occurred_at", nullable = false)
  private Instant occurredAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected MistakeOccurrenceEntity() {}

  UUID id() {
    return id;
  }

  UUID evaluationId() {
    return evaluationId;
  }

  UUID feedbackItemId() {
    return feedbackItemId;
  }

  String originalText() {
    return originalText;
  }

  String suggestedText() {
    return suggestedText;
  }

  Instant occurredAt() {
    return occurredAt;
  }
}
