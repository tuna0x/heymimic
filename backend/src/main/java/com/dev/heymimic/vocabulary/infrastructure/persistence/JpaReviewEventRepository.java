package com.dev.heymimic.vocabulary.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaReviewEventRepository extends JpaRepository<ReviewEventEntity, UUID> {
  @Query(
      """
      select count(event),
        coalesce(sum(case when event.rating = com.dev.heymimic.vocabulary.domain.ReviewRating.REMEMBERED then 1 else 0 end), 0),
        coalesce(sum(case when event.rating = com.dev.heymimic.vocabulary.domain.ReviewRating.NEEDS_REVIEW then 1 else 0 end), 0),
        coalesce(sum(event.durationSeconds), 0)
      from ReviewEventEntity event
      where event.sessionId = :sessionId and event.undoneAt is null
      """)
  Object[] summarize(@Param("sessionId") UUID sessionId);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  Optional<ReviewEventEntity> findByIdAndSessionId(UUID id, UUID sessionId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ReviewEventEntity event set event.undoneAt = :now
      where event.id = :eventId and event.sessionId = :sessionId
        and event.itemId = :itemId and event.wordId = :wordId
        and event.undoneAt is null
      """)
  int markUndone(
      @Param("eventId") UUID eventId,
      @Param("sessionId") UUID sessionId,
      @Param("itemId") UUID itemId,
      @Param("wordId") UUID wordId,
      @Param("now") java.time.Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      delete from ReviewEventEntity event
      where event.sessionId in (
        select session.id from ReviewSessionEntity session where session.userId = :userId
      )
      """)
  int deleteByUserId(@Param("userId") UUID userId);
}
