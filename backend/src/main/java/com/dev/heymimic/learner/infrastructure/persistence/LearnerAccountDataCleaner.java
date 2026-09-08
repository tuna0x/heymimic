package com.dev.heymimic.learner.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class LearnerAccountDataCleaner implements AccountDataCleaner {
  private final JpaLearnerProfileRepository profiles;

  public LearnerAccountDataCleaner(JpaLearnerProfileRepository profiles) {
    this.profiles = profiles;
  }

  @Override
  public String cleanerName() {
    return "learner";
  }

  @Override
  public int order() {
    return 500;
  }

  @Override
  @Transactional
  public void clean(UUID userId, UUID deletionJobId) {
    profiles.deleteById(userId);
    profiles.flush();
  }
}
