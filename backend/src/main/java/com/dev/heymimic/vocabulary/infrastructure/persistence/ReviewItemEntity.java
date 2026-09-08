package com.dev.heymimic.vocabulary.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vocabulary_review_items")
class ReviewItemEntity {
  @Id private UUID id;

  @Column(name = "session_id", nullable = false)
  private UUID sessionId;

  @Column(name = "word_id", nullable = false)
  private UUID wordId;

  @Column(nullable = false)
  private int position;

  @Column(name = "active_rating_event_id")
  private UUID activeEventId;

  @Column(name = "presented_at")
  private Instant presentedAt;

  protected ReviewItemEntity() {}

  ReviewItemEntity(UUID id, UUID sessionId, UUID wordId, int position, Instant presentedAt) {
    this.id = id;
    this.sessionId = sessionId;
    this.wordId = wordId;
    this.position = position;
    this.presentedAt = presentedAt;
  }

  UUID id() {
    return id;
  }

  UUID sessionId() {
    return sessionId;
  }

  UUID wordId() {
    return wordId;
  }

  int position() {
    return position;
  }

  UUID activeEventId() {
    return activeEventId;
  }

  Instant presentedAt() {
    return presentedAt;
  }
}
