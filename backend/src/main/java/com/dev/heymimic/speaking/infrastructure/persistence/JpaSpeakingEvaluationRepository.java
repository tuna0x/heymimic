package com.dev.heymimic.speaking.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaSpeakingEvaluationRepository extends JpaRepository<SpeakingEvaluationEntity, UUID> {
  Optional<SpeakingEvaluationEntity> findByIdAndUserId(UUID id, UUID userId);

  Optional<SpeakingEvaluationEntity> findByAttemptIdAndUserId(UUID attemptId, UUID userId);

  List<SpeakingEvaluationEntity> findByUserIdAndAttemptIdIn(UUID userId, List<UUID> attemptIds);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingEvaluationEntity evaluation
      set evaluation.status = com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus.RUNNING,
          evaluation.stage = com.dev.heymimic.speaking.domain.SpeakingEvaluationStage.TRANSCRIBING,
          evaluation.providerInvoked = true, evaluation.updatedAt = :now,
          evaluation.version = evaluation.version + 1
      where evaluation.id = :id and evaluation.userId = :userId
        and evaluation.status = com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus.QUEUED
      """)
  int begin(@Param("id") UUID id, @Param("userId") UUID userId, @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingEvaluationEntity evaluation
      set evaluation.transcript = :transcript,
          evaluation.stage = com.dev.heymimic.speaking.domain.SpeakingEvaluationStage.FEEDBACK,
          evaluation.updatedAt = :now, evaluation.version = evaluation.version + 1
      where evaluation.id = :id and evaluation.userId = :userId
        and evaluation.status = com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus.RUNNING
        and evaluation.stage = com.dev.heymimic.speaking.domain.SpeakingEvaluationStage.TRANSCRIBING
      """)
  int saveTranscript(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("transcript") String transcript,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingEvaluationEntity evaluation
      set evaluation.status = com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus.COMPLETED,
          evaluation.stage = com.dev.heymimic.speaking.domain.SpeakingEvaluationStage.COMPLETED,
          evaluation.result = :result, evaluation.source = :source,
          evaluation.retryable = false, evaluation.errorCode = null,
          evaluation.updatedAt = :now, evaluation.version = evaluation.version + 1
      where evaluation.id = :id and evaluation.userId = :userId
        and evaluation.status = com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus.RUNNING
        and evaluation.stage = com.dev.heymimic.speaking.domain.SpeakingEvaluationStage.FEEDBACK
      """)
  int complete(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("result") String result,
      @Param("source") String source,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingEvaluationEntity evaluation
      set evaluation.status = com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus.FAILED,
          evaluation.stage = com.dev.heymimic.speaking.domain.SpeakingEvaluationStage.FAILED,
          evaluation.errorCode = :errorCode, evaluation.retryable = false,
          evaluation.updatedAt = :now, evaluation.version = evaluation.version + 1
      where evaluation.id = :id and evaluation.userId = :userId
        and evaluation.status in (
          com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus.QUEUED,
          com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus.RUNNING
        )
      """)
  int failFinal(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("errorCode") String errorCode,
      @Param("now") Instant now);

  @Modifying
  @Query(
      value =
          """
          delete from speaking_feedback_items where evaluation_id in (
            select id from speaking_evaluations where user_id = :userId
          )
          """,
      nativeQuery = true)
  int deleteFeedbackByUserId(@Param("userId") UUID userId);

  void deleteByUserId(UUID userId);
}
