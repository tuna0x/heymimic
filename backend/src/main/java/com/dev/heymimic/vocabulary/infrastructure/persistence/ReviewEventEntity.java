package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.vocabulary.domain.ReviewRating;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "vocabulary_review_events")
class ReviewEventEntity {
  @Id private UUID id;

  @Column(name = "session_id", nullable = false)
  private UUID sessionId;

  @Column(name = "item_id", nullable = false)
  private UUID itemId;

  @Column(name = "word_id", nullable = false)
  private UUID wordId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private ReviewRating rating;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "before_state", nullable = false, columnDefinition = "jsonb")
  private String beforeState;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "after_state", nullable = false, columnDefinition = "jsonb")
  private String afterState;

  @Column(name = "duration_seconds", nullable = false)
  private int durationSeconds;

  @Column(name = "reviewed_at", nullable = false)
  private Instant reviewedAt;

  @Column(name = "undone_at")
  private Instant undoneAt;

  protected ReviewEventEntity() {}

  ReviewEventEntity(
      UUID id,
      UUID sessionId,
      UUID itemId,
      UUID wordId,
      ReviewRating rating,
      String beforeState,
      String afterState,
      int durationSeconds,
      Instant reviewedAt) {
    this.id = id;
    this.sessionId = sessionId;
    this.itemId = itemId;
    this.wordId = wordId;
    this.rating = rating;
    this.beforeState = beforeState;
    this.afterState = afterState;
    this.durationSeconds = durationSeconds;
    this.reviewedAt = reviewedAt;
  }

  UUID id() {
    return id;
  }

  UUID sessionId() {
    return sessionId;
  }

  UUID itemId() {
    return itemId;
  }

  UUID wordId() {
    return wordId;
  }

  ReviewRating rating() {
    return rating;
  }

  String beforeState() {
    return beforeState;
  }

  String afterState() {
    return afterState;
  }

  int durationSeconds() {
    return durationSeconds;
  }

  Instant reviewedAt() {
    return reviewedAt;
  }

  Instant undoneAt() {
    return undoneAt;
  }
}
