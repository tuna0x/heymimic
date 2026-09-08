package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.vocabulary.domain.ReviewSessionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vocabulary_review_sessions")
class ReviewSessionEntity {
  @Id private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private ReviewSessionStatus status;

  @Column(name = "timezone_snapshot", nullable = false, length = 64)
  private String timezone;

  @Column(name = "scheduler_version", nullable = false, length = 32)
  private String schedulerVersion;

  @Column(name = "current_index", nullable = false)
  private int currentIndex;

  @Version private long version;

  @Column(name = "started_at", nullable = false)
  private Instant startedAt;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "last_activity_at", nullable = false)
  private Instant lastActivityAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected ReviewSessionEntity() {}

  ReviewSessionEntity(UUID id, UUID userId, String timezone, String schedulerVersion, Instant now) {
    this.id = id;
    this.userId = userId;
    this.status = ReviewSessionStatus.IN_PROGRESS;
    this.timezone = timezone;
    this.schedulerVersion = schedulerVersion;
    this.startedAt = now;
    this.lastActivityAt = now;
    this.createdAt = now;
    this.updatedAt = now;
  }

  UUID id() {
    return id;
  }

  UUID userId() {
    return userId;
  }

  ReviewSessionStatus status() {
    return status;
  }

  String timezone() {
    return timezone;
  }

  String schedulerVersion() {
    return schedulerVersion;
  }

  int currentIndex() {
    return currentIndex;
  }

  long version() {
    return version;
  }

  Instant startedAt() {
    return startedAt;
  }

  Instant completedAt() {
    return completedAt;
  }

  Instant lastActivityAt() {
    return lastActivityAt;
  }
}
