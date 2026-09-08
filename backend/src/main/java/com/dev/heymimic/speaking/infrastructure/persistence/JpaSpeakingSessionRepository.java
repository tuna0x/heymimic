package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaSpeakingSessionRepository extends JpaRepository<SpeakingSessionEntity, UUID> {
  Optional<SpeakingSessionEntity> findByIdAndUserId(UUID id, UUID userId);

  Optional<SpeakingSessionEntity> findByUserIdAndStatus(UUID userId, SpeakingSessionStatus status);

  Page<SpeakingSessionEntity> findByUserIdOrderByStartedAtDescIdDesc(
      UUID userId, Pageable pageable);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query(
      "select session from SpeakingSessionEntity session where session.id = :id and session.userId = :userId")
  Optional<SpeakingSessionEntity> lockOwned(@Param("id") UUID id, @Param("userId") UUID userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingSessionEntity session
      set session.status = com.dev.heymimic.speaking.domain.SpeakingSessionStatus.ABANDONED,
          session.updatedAt = :now, session.version = session.version + 1
      where session.id = :id and session.userId = :userId
        and session.status = com.dev.heymimic.speaking.domain.SpeakingSessionStatus.IN_PROGRESS
        and session.version = :expectedVersion
      """)
  int abandon(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update SpeakingSessionEntity session
      set session.status = com.dev.heymimic.speaking.domain.SpeakingSessionStatus.COMPLETED,
          session.selectedAttemptId = :selectedAttemptId, session.completedAt = :completedAt,
          session.updatedAt = :completedAt, session.version = session.version + 1
      where session.id = :id and session.userId = :userId
        and session.status = com.dev.heymimic.speaking.domain.SpeakingSessionStatus.IN_PROGRESS
        and session.version = :expectedVersion
      """)
  int complete(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("selectedAttemptId") UUID selectedAttemptId,
      @Param("expectedVersion") long expectedVersion,
      @Param("completedAt") Instant completedAt);

  void deleteByUserId(UUID userId);
}
