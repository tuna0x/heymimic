package com.dev.heymimic.speaking.application.publicapi;

import java.util.UUID;

public interface SpeakingEvaluations {
  StartedSpeakingEvaluation start(UUID userId, UUID idempotencyKey, UUID attemptId);

  SpeakingEvaluationView getByAttempt(UUID userId, UUID attemptId);
}
