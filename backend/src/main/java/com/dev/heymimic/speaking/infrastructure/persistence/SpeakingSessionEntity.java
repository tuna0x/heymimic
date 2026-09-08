package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "speaking_sessions")
class SpeakingSessionEntity {
  @Id private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "topic_id", nullable = false)
  private UUID topicId;

  @Column(name = "topic_revision", nullable = false)
  private int topicRevision;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "prompt_snapshot", nullable = false, columnDefinition = "jsonb")
  private String promptSnapshot;

  @Column(name = "timezone_snapshot", nullable = false, length = 64)
  private String timezoneSnapshot;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private SpeakingSessionStatus status;

  @Column(name = "selected_attempt_id")
  private UUID selectedAttemptId;

  @Version private long version;

  @Column(name = "started_at", nullable = false)
  private Instant startedAt;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected SpeakingSessionEntity() {}

  SpeakingSessionEntity(
      UUID id,
      UUID userId,
      UUID topicId,
      int topicRevision,
      String promptSnapshot,
      String timezoneSnapshot,
      Instant now) {
    this.id = id;
    this.userId = userId;
    this.topicId = topicId;
    this.topicRevision = topicRevision;
    this.promptSnapshot = promptSnapshot;
    this.timezoneSnapshot = timezoneSnapshot;
    this.status = SpeakingSessionStatus.IN_PROGRESS;
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

  UUID topicId() {
    return topicId;
  }

  int topicRevision() {
    return topicRevision;
  }

  String promptSnapshot() {
    return promptSnapshot;
  }

  String timezoneSnapshot() {
    return timezoneSnapshot;
  }

  SpeakingSessionStatus status() {
    return status;
  }

  UUID selectedAttemptId() {
    return selectedAttemptId;
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
