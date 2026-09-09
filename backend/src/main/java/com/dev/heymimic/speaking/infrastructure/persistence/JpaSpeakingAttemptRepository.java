package com.dev.heymimic.speaking.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaSpeakingAttemptRepository extends JpaRepository<SpeakingAttemptEntity, UUID> {
  @Query(
      "select coalesce(max(attempt.attemptNumber), 0) + 1 from SpeakingAttemptEntity attempt where attempt.sessionId = :sessionId")
  int nextAttemptNumber(@Param("sessionId") UUID sessionId);

  @Query(
      """
      select attempt from SpeakingAttemptEntity attempt
      where attempt.id = :id and attempt.sessionId in (
        select session.id from SpeakingSessionEntity session where session.userId = :userId
      )
      """)
  Optional<SpeakingAttemptEntity> findOwned(@Param("id") UUID id, @Param("userId") UUID userId);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query(
      """
      select attempt from SpeakingAttemptEntity attempt
      where attempt.id = :id and attempt.sessionId in (
        select session.id from SpeakingSessionEntity session where session.userId = :userId
      )
      """)
  Optional<SpeakingAttemptEntity> lockOwned(@Param("id") UUID id, @Param("userId") UUID userId);

  @Query(
      """
      select attempt from SpeakingAttemptEntity attempt
      where attempt.sessionId = :sessionId and attempt.sessionId in (
        select session.id from SpeakingSessionEntity session where session.userId = :userId
      )
      order by attempt.attemptNumber
      """)
  java.util.List<SpeakingAttemptEntity> findBySessionOwned(
      @Param("sessionId") UUID sessionId, @Param("userId") UUID userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingAttemptEntity attempt
      set attempt.uploadExpiresAt = :expiresAt, attempt.updatedAt = :now,
          attempt.version = attempt.version + 1
      where attempt.id = :id and attempt.version = :expectedVersion
        and attempt.audioState = com.dev.heymimic.speaking.domain.AudioState.AWAITING_UPLOAD
        and attempt.sessionId in (
          select session.id from SpeakingSessionEntity session where session.userId = :userId
        )
      """)
  int renewUpload(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("expiresAt") Instant expiresAt,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingAttemptEntity attempt
      set attempt.objectVersion = :objectVersion, attempt.checksum = :checksum,
          attempt.sizeBytes = :sizeBytes, attempt.mimeType = :mimeType,
          attempt.durationMs = :durationMs,
          attempt.audioState = com.dev.heymimic.speaking.domain.AudioState.AVAILABLE,
          attempt.retentionUntil = :retentionUntil, attempt.updatedAt = :now,
          attempt.version = attempt.version + 1
      where attempt.id = :id and attempt.version = :expectedVersion
        and attempt.audioState = com.dev.heymimic.speaking.domain.AudioState.AWAITING_UPLOAD
        and attempt.sessionId in (
          select session.id from SpeakingSessionEntity session where session.userId = :userId
        )
      """)
  int seal(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("objectVersion") String objectVersion,
      @Param("checksum") String checksum,
      @Param("sizeBytes") long sizeBytes,
      @Param("mimeType") String mimeType,
      @Param("durationMs") long durationMs,
      @Param("retentionUntil") Instant retentionUntil,
      @Param("now") Instant now);

  @Query(
      """
      select attempt from SpeakingAttemptEntity attempt
      where attempt.audioState = com.dev.heymimic.speaking.domain.AudioState.AVAILABLE
        and attempt.retentionUntil <= :now
      order by attempt.retentionUntil, attempt.id
      """)
  List<SpeakingAttemptEntity> findExpiredAudio(@Param("now") Instant now, Pageable pageable);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingAttemptEntity attempt
      set attempt.audioState = com.dev.heymimic.speaking.domain.AudioState.DELETED,
          attempt.updatedAt = :now, attempt.version = attempt.version + 1
      where attempt.id = :id and attempt.version = :expectedVersion
        and attempt.audioState = com.dev.heymimic.speaking.domain.AudioState.AVAILABLE
        and attempt.retentionUntil <= :now
      """)
  int markAudioDeleted(
      @Param("id") UUID id,
      @Param("expectedVersion") long expectedVersion,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingAttemptEntity attempt
      set attempt.processingState = com.dev.heymimic.speaking.domain.AttemptProcessingState.QUEUED,
          attempt.updatedAt = :now, attempt.version = attempt.version + 1
      where attempt.id = :id and attempt.version = :expectedVersion
        and attempt.audioState = com.dev.heymimic.speaking.domain.AudioState.AVAILABLE
        and attempt.processingState = com.dev.heymimic.speaking.domain.AttemptProcessingState.NOT_REQUESTED
        and attempt.sessionId in (
          select session.id from SpeakingSessionEntity session where session.userId = :userId
        )
      """)
  int queueEvaluation(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingAttemptEntity attempt
      set attempt.processingState = com.dev.heymimic.speaking.domain.AttemptProcessingState.FAILED,
          attempt.updatedAt = :now, attempt.version = attempt.version + 1
      where attempt.id = :id
        and attempt.processingState in (
          com.dev.heymimic.speaking.domain.AttemptProcessingState.QUEUED,
          com.dev.heymimic.speaking.domain.AttemptProcessingState.RUNNING
        )
        and attempt.sessionId in (
          select session.id from SpeakingSessionEntity session where session.userId = :userId
        )
      """)
  int failEvaluation(@Param("id") UUID id, @Param("userId") UUID userId, @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingAttemptEntity attempt
      set attempt.processingState = com.dev.heymimic.speaking.domain.AttemptProcessingState.RUNNING,
          attempt.updatedAt = :now, attempt.version = attempt.version + 1
      where attempt.id = :id
        and attempt.processingState = com.dev.heymimic.speaking.domain.AttemptProcessingState.QUEUED
        and attempt.audioState = com.dev.heymimic.speaking.domain.AudioState.AVAILABLE
        and attempt.sessionId in (
          select session.id from SpeakingSessionEntity session where session.userId = :userId
        )
      """)
  int beginEvaluation(
      @Param("id") UUID id, @Param("userId") UUID userId, @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingAttemptEntity attempt
      set attempt.processingState = com.dev.heymimic.speaking.domain.AttemptProcessingState.COMPLETED,
          attempt.updatedAt = :now, attempt.version = attempt.version + 1
      where attempt.id = :id
        and attempt.processingState = com.dev.heymimic.speaking.domain.AttemptProcessingState.RUNNING
        and attempt.sessionId in (
          select session.id from SpeakingSessionEntity session where session.userId = :userId
        )
      """)
  int completeEvaluation(
      @Param("id") UUID id, @Param("userId") UUID userId, @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      delete from SpeakingAttemptEntity attempt where attempt.sessionId in (
        select session.id from SpeakingSessionEntity session where session.userId = :userId
      )
      """)
  int deleteByOwner(@Param("userId") UUID userId);
}
