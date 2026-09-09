package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import com.dev.heymimic.speaking.application.port.SpeakingEvaluationStore;
import com.dev.heymimic.speaking.application.port.SpeakingSessionStore;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SpeakingAccountDataCleaner implements AccountDataCleaner {
  private final SpeakingSessionStore sessions;
  private final com.dev.heymimic.speaking.application.port.SpeakingAttemptStore attempts;
  private final SpeakingEvaluationStore evaluations;

  public SpeakingAccountDataCleaner(
      SpeakingSessionStore sessions,
      com.dev.heymimic.speaking.application.port.SpeakingAttemptStore attempts,
      SpeakingEvaluationStore evaluations) {
    this.sessions = sessions;
    this.attempts = attempts;
    this.evaluations = evaluations;
  }

  @Override
  public String cleanerName() {
    return "speaking";
  }

  @Override
  public int order() {
    return 350;
  }

  @Override
  @Transactional
  public void clean(UUID userId, UUID deletionJobId) {
    evaluations.deleteByUserId(userId);
    attempts.deleteByUserId(userId);
    sessions.deleteByUserId(userId);
  }
}
