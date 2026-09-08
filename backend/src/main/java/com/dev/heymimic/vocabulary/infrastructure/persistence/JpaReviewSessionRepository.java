package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.vocabulary.domain.ReviewSessionStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaReviewSessionRepository extends JpaRepository<ReviewSessionEntity, UUID> {
  Optional<ReviewSessionEntity> findByIdAndUserId(UUID id, UUID userId);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query(
      "select session from ReviewSessionEntity session where session.id = :id and session.userId = :userId")
  Optional<ReviewSessionEntity> lockOwned(@Param("id") UUID id, @Param("userId") UUID userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ReviewSessionEntity session
      set session.currentIndex = session.currentIndex + 1,
          session.lastActivityAt = :now,
          session.updatedAt = :now,
          session.version = session.version + 1
      where session.id = :id and session.userId = :userId
        and session.status = com.dev.heymimic.vocabulary.domain.ReviewSessionStatus.IN_PROGRESS
        and session.version = :expectedVersion and session.currentIndex = :expectedIndex
      """)
  int advance(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("expectedIndex") int expectedIndex,
      @Param("now") java.time.Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ReviewSessionEntity session
      set session.currentIndex = session.currentIndex - 1,
          session.lastActivityAt = :now,
          session.updatedAt = :now,
          session.version = session.version + 1
      where session.id = :id and session.userId = :userId
        and session.status = com.dev.heymimic.vocabulary.domain.ReviewSessionStatus.IN_PROGRESS
        and session.version = :expectedVersion and session.currentIndex = :expectedIndex
        and session.currentIndex > 0
      """)
  int rewind(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("expectedIndex") int expectedIndex,
      @Param("now") java.time.Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ReviewSessionEntity session
      set session.status = :status, session.completedAt = :completedAt,
          session.lastActivityAt = :now, session.updatedAt = :now,
          session.version = session.version + 1
      where session.id = :id and session.userId = :userId
        and session.status = com.dev.heymimic.vocabulary.domain.ReviewSessionStatus.IN_PROGRESS
        and session.version = :expectedVersion
      """)
  int finish(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("expectedVersion") long expectedVersion,
      @Param("status") ReviewSessionStatus status,
      @Param("completedAt") java.time.Instant completedAt,
      @Param("now") java.time.Instant now);

  Optional<ReviewSessionEntity> findByUserIdAndStatus(UUID userId, ReviewSessionStatus status);

  @Query(
      value =
          """
          select * from vocabulary_review_sessions
          where status = 'IN_PROGRESS' and last_activity_at <= :cutoff
          order by last_activity_at, id
          for update skip locked
          limit :limit
          """,
      nativeQuery = true)
  java.util.List<ReviewSessionEntity> lockInactive(
      @Param("cutoff") java.time.Instant cutoff, @Param("limit") int limit);

  void deleteByUserId(UUID userId);
}
