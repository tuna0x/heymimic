package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.ReviewEventRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewItemRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewSessionRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewSessionStore;
import com.dev.heymimic.vocabulary.application.port.ReviewSummaryRecord;
import com.dev.heymimic.vocabulary.domain.ReviewRating;
import com.dev.heymimic.vocabulary.domain.ReviewSessionStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;

@Repository
public class JpaReviewSessionStore implements ReviewSessionStore {
  private final JpaReviewSessionRepository sessions;
  private final JpaReviewItemRepository items;
  private final JpaReviewEventRepository events;

  public JpaReviewSessionStore(
      JpaReviewSessionRepository sessions,
      JpaReviewItemRepository items,
      JpaReviewEventRepository events) {
    this.sessions = sessions;
    this.items = items;
    this.events = events;
  }

  @Override
  public void create(
      UUID id,
      UUID userId,
      String timezone,
      String schedulerVersion,
      List<UUID> wordIds,
      Instant now) {
    try {
      sessions.saveAndFlush(new ReviewSessionEntity(id, userId, timezone, schedulerVersion, now));
      items.saveAll(
          IntStream.range(0, wordIds.size())
              .mapToObj(
                  position ->
                      new ReviewItemEntity(
                          UUID.randomUUID(),
                          id,
                          wordIds.get(position),
                          position,
                          position == 0 ? now : null))
              .toList());
      items.flush();
    } catch (DataIntegrityViolationException exception) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "ACTIVE_REVIEW_SESSION_EXISTS",
          "An active vocabulary review session already exists");
    }
  }

  @Override
  public Optional<ReviewSessionRecord> findOwned(UUID id, UUID userId) {
    return sessions.findByIdAndUserId(id, userId).map(this::record);
  }

  @Override
  public Optional<ReviewSessionRecord> lockOwned(UUID id, UUID userId) {
    return sessions.lockOwned(id, userId).map(this::record);
  }

  @Override
  public Optional<ReviewSessionRecord> findActive(UUID userId) {
    return sessions
        .findByUserIdAndStatus(userId, ReviewSessionStatus.IN_PROGRESS)
        .map(this::record);
  }

  @Override
  public List<ReviewSessionRecord> lockInactive(Instant cutoff, int limit) {
    return sessions.lockInactive(cutoff, limit).stream().map(this::record).toList();
  }

  @Override
  public List<ReviewItemRecord> findItems(UUID sessionId) {
    return items.findBySessionIdOrderByPosition(sessionId).stream()
        .map(
            item ->
                new ReviewItemRecord(
                    item.id(),
                    item.sessionId(),
                    item.wordId(),
                    item.position(),
                    item.activeEventId(),
                    item.presentedAt()))
        .toList();
  }

  @Override
  public boolean recordRating(
      UUID eventId,
      ReviewSessionRecord session,
      ReviewItemRecord item,
      ReviewRating rating,
      String beforeStateJson,
      String afterStateJson,
      int durationSeconds,
      UUID nextItemId,
      Instant now) {
    events.saveAndFlush(
        new ReviewEventEntity(
            eventId,
            session.id(),
            item.id(),
            item.wordId(),
            rating,
            beforeStateJson,
            afterStateJson,
            durationSeconds,
            now));
    if (items.activateEvent(item.id(), session.id(), item.wordId(), eventId) != 1) return false;
    if (nextItemId != null && items.markPresented(nextItemId, session.id(), now) != 1) return false;
    return sessions.advance(
            session.id(), session.userId(), session.version(), session.currentIndex(), now)
        == 1;
  }

  @Override
  public Optional<ReviewEventRecord> findEvent(UUID eventId, UUID sessionId) {
    return events.findByIdAndSessionId(eventId, sessionId).map(this::eventRecord);
  }

  @Override
  public boolean undoRating(
      ReviewSessionRecord session, ReviewItemRecord item, ReviewEventRecord event, Instant now) {
    if (events.markUndone(event.id(), session.id(), item.id(), item.wordId(), now) != 1)
      return false;
    if (items.clearActiveEvent(item.id(), session.id(), item.wordId(), event.id(), now) != 1)
      return false;
    return sessions.rewind(
            session.id(), session.userId(), session.version(), session.currentIndex(), now)
        == 1;
  }

  @Override
  public ReviewSummaryRecord summarize(UUID sessionId) {
    Object[] values = events.summarize(sessionId);
    return new ReviewSummaryRecord(
        ((Number) values[0]).intValue(),
        ((Number) values[1]).intValue(),
        ((Number) values[2]).intValue(),
        ((Number) values[3]).intValue());
  }

  @Override
  public boolean complete(ReviewSessionRecord session, Instant now) {
    return sessions.finish(
            session.id(),
            session.userId(),
            session.version(),
            ReviewSessionStatus.COMPLETED,
            now,
            now)
        == 1;
  }

  @Override
  public boolean abandon(ReviewSessionRecord session, Instant now) {
    return sessions.finish(
            session.id(),
            session.userId(),
            session.version(),
            ReviewSessionStatus.ABANDONED,
            null,
            now)
        == 1;
  }

  private ReviewEventRecord eventRecord(ReviewEventEntity event) {
    return new ReviewEventRecord(
        event.id(),
        event.sessionId(),
        event.itemId(),
        event.wordId(),
        event.rating(),
        event.beforeState(),
        event.afterState(),
        event.durationSeconds(),
        event.reviewedAt(),
        event.undoneAt());
  }

  private ReviewSessionRecord record(ReviewSessionEntity session) {
    return new ReviewSessionRecord(
        session.id(),
        session.userId(),
        session.status(),
        session.timezone(),
        session.schedulerVersion(),
        session.currentIndex(),
        session.version(),
        session.startedAt(),
        session.completedAt(),
        session.lastActivityAt());
  }
}
