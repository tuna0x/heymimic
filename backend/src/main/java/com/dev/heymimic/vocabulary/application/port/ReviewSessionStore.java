package com.dev.heymimic.vocabulary.application.port;

import com.dev.heymimic.vocabulary.domain.ReviewRating;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewSessionStore {
  void create(
      UUID id,
      UUID userId,
      String timezone,
      String schedulerVersion,
      List<UUID> wordIds,
      Instant now);

  Optional<ReviewSessionRecord> findOwned(UUID id, UUID userId);

  Optional<ReviewSessionRecord> lockOwned(UUID id, UUID userId);

  Optional<ReviewSessionRecord> findActive(UUID userId);

  List<ReviewSessionRecord> lockInactive(Instant cutoff, int limit);

  List<ReviewItemRecord> findItems(UUID sessionId);

  boolean recordRating(
      UUID eventId,
      ReviewSessionRecord session,
      ReviewItemRecord item,
      ReviewRating rating,
      String beforeStateJson,
      String afterStateJson,
      int durationSeconds,
      UUID nextItemId,
      Instant now);

  Optional<ReviewEventRecord> findEvent(UUID eventId, UUID sessionId);

  boolean undoRating(
      ReviewSessionRecord session, ReviewItemRecord item, ReviewEventRecord event, Instant now);

  ReviewSummaryRecord summarize(UUID sessionId);

  boolean complete(ReviewSessionRecord session, Instant now);

  boolean abandon(ReviewSessionRecord session, Instant now);
}
