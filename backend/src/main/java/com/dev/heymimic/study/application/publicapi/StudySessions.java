package com.dev.heymimic.study.application.publicapi;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudySessions {
  StartedStudySession start(UUID userId, UUID idempotencyKey, List<PlannedStudyStep> plannedSteps);

  StudySessionView get(UUID userId, UUID sessionId);

  Optional<StudySessionView> active(UUID userId);

  StudySessionView advance(UUID userId, UUID sessionId, int targetStep, long expectedVersion);

  CompletedStudySession complete(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion);

  AbandonedStudySession abandon(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion);
}
