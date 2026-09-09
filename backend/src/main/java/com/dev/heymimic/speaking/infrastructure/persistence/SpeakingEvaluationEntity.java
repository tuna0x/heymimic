package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.speaking.domain.SpeakingEvaluationStage;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus;
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
@Table(name = "speaking_evaluations")
class SpeakingEvaluationEntity {
  @Id private UUID id;

  @Column(name = "attempt_id", nullable = false, unique = true)
  private UUID attemptId;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private SpeakingEvaluationStatus status;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private SpeakingEvaluationStage stage;

  @Column(columnDefinition = "text")
  private String transcript;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  private String result;

  @Column(length = 32)
  private String source;

  @Column(name = "job_id", nullable = false, unique = true)
  private UUID jobId;

  @Column(name = "quota_reservation_id", nullable = false, unique = true)
  private UUID quotaReservationId;

  @Column(name = "error_code", length = 100)
  private String errorCode;

  @Column(nullable = false)
  private boolean retryable;

  @Column(name = "provider_invoked", nullable = false)
  private boolean providerInvoked;

  @Version private long version;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected SpeakingEvaluationEntity() {}

  SpeakingEvaluationEntity(
      UUID id, UUID attemptId, UUID userId, UUID jobId, UUID quotaReservationId, Instant now) {
    this.id = id;
    this.attemptId = attemptId;
    this.userId = userId;
    this.status = SpeakingEvaluationStatus.QUEUED;
    this.stage = SpeakingEvaluationStage.QUEUED;
    this.jobId = jobId;
    this.quotaReservationId = quotaReservationId;
    this.retryable = true;
    this.createdAt = now;
    this.updatedAt = now;
  }

  UUID id() {
    return id;
  }

  UUID attemptId() {
    return attemptId;
  }

  UUID userId() {
    return userId;
  }

  SpeakingEvaluationStatus status() {
    return status;
  }

  SpeakingEvaluationStage stage() {
    return stage;
  }

  String transcript() {
    return transcript;
  }

  String result() {
    return result;
  }

  String source() {
    return source;
  }

  UUID jobId() {
    return jobId;
  }

  UUID quotaReservationId() {
    return quotaReservationId;
  }

  String errorCode() {
    return errorCode;
  }

  boolean retryable() {
    return retryable;
  }

  boolean providerInvoked() {
    return providerInvoked;
  }

  long version() {
    return version;
  }

  Instant createdAt() {
    return createdAt;
  }

  Instant updatedAt() {
    return updatedAt;
  }
}
