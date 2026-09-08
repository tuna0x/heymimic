package com.dev.heymimic.learner.application.publicapi;

import java.util.UUID;

public interface LearnerProfiles {
  LearnerProfileView get(UUID userId);

  LearnerProfileView update(UUID userId, UpdateLearnerProfile command);

  LearnerProfileView completeOnboarding(UUID userId, CompleteOnboarding command);
}
