package com.dev.heymimic.speaking.application.publicapi;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpeakingPractice {
  List<SpeakingTopicView> topics(String category, String level);

  StartedSpeakingSession start(UUID userId, UUID idempotencyKey, UUID topicId);

  SpeakingSessionView get(UUID userId, UUID sessionId);

  Optional<SpeakingSessionView> active(UUID userId);

  SpeakingSessionHistoryPage history(UUID userId, int page, int size);

  CompletedSpeakingSession complete(
      UUID userId,
      UUID idempotencyKey,
      UUID sessionId,
      UUID selectedAttemptId,
      long expectedVersion);

  AbandonedSpeakingSession abandon(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion);
}
