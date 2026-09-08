package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus;
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
@Table(name = "vocabulary_context_analyses")
class ContextAnalysisEntity {
  @Id private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "input_hash", nullable = false, length = 64)
  private String inputHash;

  @Column(name = "input_text", nullable = false, length = 10000)
  private String inputText;

  @Column(name = "target_language", nullable = false, length = 16)
  private String targetLanguage;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private ContextAnalysisStatus status;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  private String result;

  @Column(name = "job_id", nullable = false, unique = true)
  private UUID jobId;

  @Column(name = "quota_reservation_id", nullable = false, unique = true)
  private UUID quotaReservationId;

  @Column(name = "error_code", length = 100)
  private String errorCode;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected ContextAnalysisEntity() {}

  ContextAnalysisEntity(
      UUID id,
      UUID userId,
      String inputHash,
      String inputText,
      String targetLanguage,
      UUID jobId,
      UUID quotaReservationId,
      Instant expiresAt,
      Instant now) {
    this.id = id;
    this.userId = userId;
    this.inputHash = inputHash;
    this.inputText = inputText;
    this.targetLanguage = targetLanguage;
    this.status = ContextAnalysisStatus.PENDING;
    this.jobId = jobId;
    this.quotaReservationId = quotaReservationId;
    this.expiresAt = expiresAt;
    this.createdAt = now;
    this.updatedAt = now;
  }

  UUID id() {
    return id;
  }

  UUID userId() {
    return userId;
  }

  String inputText() {
    return inputText;
  }

  String targetLanguage() {
    return targetLanguage;
  }

  ContextAnalysisStatus status() {
    return status;
  }

  String result() {
    return result;
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

  Instant expiresAt() {
    return expiresAt;
  }
}
