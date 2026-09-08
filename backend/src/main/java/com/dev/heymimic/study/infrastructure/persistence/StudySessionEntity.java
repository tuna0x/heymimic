package com.dev.heymimic.study.infrastructure.persistence;

import com.dev.heymimic.study.domain.StudySessionStatus;
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
@Table(name = "study_sessions")
class StudySessionEntity {
  @Id private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private StudySessionStatus status;

  @Column(name = "timezone_snapshot", nullable = false, length = 64)
  private String timezoneSnapshot;

  @Column(name = "current_step", nullable = false)
  private int currentStep;

  @Version private long version;

  @Column(name = "started_at", nullable = false)
  private Instant startedAt;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected StudySessionEntity() {}

  StudySessionEntity(UUID id, UUID userId, String timezoneSnapshot, Instant now) {
    this.id = id;
    this.userId = userId;
    this.status = StudySessionStatus.IN_PROGRESS;
    this.timezoneSnapshot = timezoneSnapshot;
    this.startedAt = now;
    this.createdAt = now;
    this.updatedAt = now;
  }

  UUID id() {
    return id;
  }

  UUID userId() {
    return userId;
  }

  StudySessionStatus status() {
    return status;
  }

  String timezoneSnapshot() {
    return timezoneSnapshot;
  }

  int currentStep() {
    return currentStep;
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
}
