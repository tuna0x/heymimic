package com.dev.heymimic.learner.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface LearnerProfileStore {
  void create(UUID userId, String name, String timezone, Instant now);

  Optional<LearnerProfileRecord> findByUserId(UUID userId);

  boolean updateProfile(
      UUID userId,
      String name,
      String goal,
      Integer dailyMinutesGoal,
      String timezone,
      long expectedVersion,
      Instant now);

  boolean completeOnboarding(
      UUID userId,
      String goal,
      String selfAssessedLevel,
      int dailyMinutesGoal,
      String targetLanguage,
      String timezone,
      long expectedVersion,
      Instant now);
}
