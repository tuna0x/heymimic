package com.dev.heymimic.vocabulary.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaReviewItemRepository extends JpaRepository<ReviewItemEntity, UUID> {
  List<ReviewItemEntity> findBySessionIdOrderByPosition(UUID sessionId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ReviewItemEntity item set item.activeEventId = :eventId
      where item.id = :itemId and item.sessionId = :sessionId
        and item.wordId = :wordId and item.activeEventId is null
      """)
  int activateEvent(
      @Param("itemId") UUID itemId,
      @Param("sessionId") UUID sessionId,
      @Param("wordId") UUID wordId,
      @Param("eventId") UUID eventId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ReviewItemEntity item
      set item.activeEventId = null, item.presentedAt = :now
      where item.id = :itemId and item.sessionId = :sessionId
        and item.wordId = :wordId and item.activeEventId = :eventId
      """)
  int clearActiveEvent(
      @Param("itemId") UUID itemId,
      @Param("sessionId") UUID sessionId,
      @Param("wordId") UUID wordId,
      @Param("eventId") UUID eventId,
      @Param("now") java.time.Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      "update ReviewItemEntity item set item.presentedAt = :now where item.id = :itemId and item.sessionId = :sessionId")
  int markPresented(
      @Param("itemId") UUID itemId,
      @Param("sessionId") UUID sessionId,
      @Param("now") java.time.Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update ReviewItemEntity item set item.activeEventId = null
      where item.sessionId in (
        select session.id from ReviewSessionEntity session where session.userId = :userId
      )
      """)
  int clearActiveEventsForUser(@Param("userId") UUID userId);
}
