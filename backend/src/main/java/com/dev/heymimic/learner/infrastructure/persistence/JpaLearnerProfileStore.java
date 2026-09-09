package com.dev.heymimic.learner.infrastructure.persistence;

import com.dev.heymimic.learner.application.port.LearnerProfileRecord;
import com.dev.heymimic.learner.application.port.LearnerProfileStore;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaLearnerProfileStore implements LearnerProfileStore {
  private final JpaLearnerProfileRepository repository;

  public JpaLearnerProfileStore(JpaLearnerProfileRepository repository) {
    this.repository = repository;
  }

  @Override
  public void create(UUID userId, String name, String timezone, Instant now) {
    repository.saveAndFlush(new LearnerProfileEntity(userId, name, timezone, now));
  }

  @Override
  public Optional<LearnerProfileRecord> findByUserId(UUID userId) {
    return repository.findById(userId).map(this::record);
  }

  @Override
  public boolean updateProfile(
      UUID userId,
      String name,
      String goal,
      Integer dailyMinutesGoal,
      String timezone,
      long expectedVersion,
      Instant now) {
    return repository.updateProfile(
            userId, name, goal, dailyMinutesGoal, timezone, expectedVersion, now)
        == 1;
  }

  @Override
  public boolean completeOnboarding(
      UUID userId,
      String goal,
      String selfAssessedLevel,
      int dailyMinutesGoal,
      String targetLanguage,
      String timezone,
      long expectedVersion,
      Instant now) {
    return repository.completeOnboarding(
            userId,
            goal,
            selfAssessedLevel,
            dailyMinutesGoal,
            targetLanguage,
            timezone,
            expectedVersion,
            now)
        == 1;
  }

  private LearnerProfileRecord record(LearnerProfileEntity profile) {
    return new LearnerProfileRecord(
        profile.userId(),
        profile.name(),
        profile.targetLanguage(),
        profile.goal(),
        profile.selfAssessedLevel(),
        profile.dailyMinutesGoal(),
        profile.timezone(),
        profile.onboardingCompletedAt(),
        profile.version());
  }
}
