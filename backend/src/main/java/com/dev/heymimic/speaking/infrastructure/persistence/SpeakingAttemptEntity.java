package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.AudioState;
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
@Table(name = "speaking_attempts")
class SpeakingAttemptEntity {
  @Id private UUID id;

  @Column(name = "session_id", nullable = false)
  private UUID sessionId;

  @Column(name = "attempt_number", nullable = false)
  private int attemptNumber;

  @Column(name = "object_key", nullable = false, length = 500)
  private String objectKey;

  @Column(name = "object_version", length = 200)
  private String objectVersion;

  @Column(length = 64)
  private String checksum;

  @Column(name = "size_bytes", nullable = false)
  private long sizeBytes;

  @Column(name = "mime_type", nullable = false, length = 100)
  private String mimeType;

  @Column(name = "duration_ms")
  private Long durationMs;

  @Enumerated(EnumType.STRING)
  @Column(name = "audio_state", nullable = false, length = 32)
  private AudioState audioState;

  @Enumerated(EnumType.STRING)
  @Column(name = "processing_state", nullable = false, length = 32)
  private AttemptProcessingState processingState;

  @Column(name = "upload_expires_at", nullable = false)
  private Instant uploadExpiresAt;

  @Column(name = "retention_until")
  private Instant retentionUntil;

  @Version private long version;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected SpeakingAttemptEntity() {}

  SpeakingAttemptEntity(
      UUID id,
      UUID sessionId,
      int attemptNumber,
      String objectKey,
      String mimeType,
      long sizeBytes,
      Instant uploadExpiresAt,
      Instant now) {
    this.id = id;
    this.sessionId = sessionId;
    this.attemptNumber = attemptNumber;
    this.objectKey = objectKey;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
    this.audioState = AudioState.AWAITING_UPLOAD;
    this.processingState = AttemptProcessingState.NOT_REQUESTED;
    this.uploadExpiresAt = uploadExpiresAt;
    this.createdAt = now;
    this.updatedAt = now;
  }

  UUID id() {
    return id;
  }

  UUID sessionId() {
    return sessionId;
  }

  int attemptNumber() {
    return attemptNumber;
  }

  String objectKey() {
    return objectKey;
  }

  String objectVersion() {
    return objectVersion;
  }

  String checksum() {
    return checksum;
  }

  long sizeBytes() {
    return sizeBytes;
  }

  String mimeType() {
    return mimeType;
  }

  Long durationMs() {
    return durationMs;
  }

  AudioState audioState() {
    return audioState;
  }

  AttemptProcessingState processingState() {
    return processingState;
  }

  Instant uploadExpiresAt() {
    return uploadExpiresAt;
  }

  Instant retentionUntil() {
    return retentionUntil;
  }

  long version() {
    return version;
  }

  Instant createdAt() {
    return createdAt;
  }
}
