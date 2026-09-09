package com.dev.heymimic.study.infrastructure.persistence;

import com.dev.heymimic.study.domain.StudySessionStatus;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaStudySessionRepository extends JpaRepository<StudySessionEntity, UUID> {
  Optional<StudySessionEntity> findByIdAndUserId(UUID id, UUID userId);

  Optional<StudySessionEntity> findByUserIdAndStatus(UUID userId, StudySessionStatus status);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query(
      "select session from StudySessionEntity session where session.id = :id and session.userId = :userId")
  Optional<StudySessionEntity> lockOwned(@Param("id") UUID id, @Param("userId") UUID userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update StudySessionEntity session
      set session.currentStep = :targetStep, session.updatedAt = :now,
          session.version = session.version + 1
      where session.id = :id and session.userId = :userId
        and session.status = com.dev.heymimic.study.domain.StudySessionStatus.IN_PROGRESS
        and session.version = :expectedVersion
      """)
  int advance(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("targetStep") int targetStep,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update StudySessionEntity session
      set session.status = com.dev.heymimic.study.domain.StudySessionStatus.COMPLETED,
          session.completedAt = :completedAt, session.updatedAt = :completedAt,
          session.version = session.version + 1
      where session.id = :id and session.userId = :userId
        and session.status = com.dev.heymimic.study.domain.StudySessionStatus.IN_PROGRESS
        and session.version = :expectedVersion
      """)
  int complete(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("completedAt") Instant completedAt);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update StudySessionEntity session
      set session.status = com.dev.heymimic.study.domain.StudySessionStatus.ABANDONED,
          session.updatedAt = :now, session.version = session.version + 1
      where session.id = :id and session.userId = :userId
        and session.status = com.dev.heymimic.study.domain.StudySessionStatus.IN_PROGRESS
        and session.version = :expectedVersion
      """)
  int abandon(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("now") Instant now);

  void deleteByUserId(UUID userId);
}
