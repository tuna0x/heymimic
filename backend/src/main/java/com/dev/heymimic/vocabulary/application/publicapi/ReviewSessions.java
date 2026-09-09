package com.dev.heymimic.vocabulary.application.publicapi;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewSessions {
  StartedReviewSession start(UUID userId, UUID idempotencyKey, List<UUID> wordIds);

  ReviewSessionView get(UUID userId, UUID sessionId);

  Optional<ReviewSessionView> active(UUID userId);

  RatedReviewSession rate(
      UUID userId,
      UUID idempotencyKey,
      UUID sessionId,
      UUID wordId,
      String rating,
      long expectedVersion);

  UndoneReviewRating undo(
      UUID userId, UUID idempotencyKey, UUID sessionId, UUID eventId, long expectedVersion);

  ReviewCompletionView complete(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion);

  AbandonedReviewSession abandon(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion);
}
