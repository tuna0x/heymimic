package com.dev.heymimic.speaking.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "speaking_feedback_items")
class SpeakingFeedbackItemEntity {
  @Id private UUID id;

  @Column(name = "evaluation_id", nullable = false)
  private UUID evaluationId;

  @Column(nullable = false)
  private int position;

  @Column(nullable = false, length = 32)
  private String category;

  @Column(name = "original_text", length = 2000)
  private String originalText;

  @Column(name = "improved_text", length = 2000)
  private String improvedText;

  @Column(nullable = false, length = 2000)
  private String note;

  @Column(name = "pattern_key", length = 100)
  private String patternKey;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected SpeakingFeedbackItemEntity() {}

  SpeakingFeedbackItemEntity(
      UUID id,
      UUID evaluationId,
      int position,
      String category,
      String originalText,
      String improvedText,
      String note,
      String patternKey,
      Instant createdAt) {
    this.id = id;
    this.evaluationId = evaluationId;
    this.position = position;
    this.category = category;
    this.originalText = originalText;
    this.improvedText = improvedText;
    this.note = note;
    this.patternKey = patternKey;
    this.createdAt = createdAt;
  }
}
