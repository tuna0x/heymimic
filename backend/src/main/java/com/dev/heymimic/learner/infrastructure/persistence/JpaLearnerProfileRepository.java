package com.dev.heymimic.learner.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaLearnerProfileRepository extends JpaRepository<LearnerProfileEntity, UUID> {
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update LearnerProfileEntity profile
      set profile.name = coalesce(:name, profile.name),
          profile.goal = coalesce(:goal, profile.goal),
          profile.dailyMinutesGoal = coalesce(:dailyMinutesGoal, profile.dailyMinutesGoal),
          profile.timezone = coalesce(:timezone, profile.timezone),
          profile.updatedAt = :now,
          profile.version = profile.version + 1
      where profile.userId = :userId and profile.version = :expectedVersion
      """)
  int updateProfile(
      @Param("userId") UUID userId,
      @Param("name") String name,
      @Param("goal") String goal,
      @Param("dailyMinutesGoal") Integer dailyMinutesGoal,
      @Param("timezone") String timezone,
      @Param("expectedVersion") long expectedVersion,
      @Param("now") java.time.Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update LearnerProfileEntity profile
      set profile.goal = :goal,
          profile.selfAssessedLevel = :selfAssessedLevel,
          profile.dailyMinutesGoal = :dailyMinutesGoal,
          profile.targetLanguage = :targetLanguage,
          profile.timezone = :timezone,
          profile.onboardingCompletedAt = :now,
          profile.updatedAt = :now,
          profile.version = profile.version + 1
      where profile.userId = :userId and profile.version = :expectedVersion
        and profile.onboardingCompletedAt is null
      """)
  int completeOnboarding(
      @Param("userId") UUID userId,
      @Param("goal") String goal,
      @Param("selfAssessedLevel") String selfAssessedLevel,
      @Param("dailyMinutesGoal") int dailyMinutesGoal,
      @Param("targetLanguage") String targetLanguage,
      @Param("timezone") String timezone,
      @Param("expectedVersion") long expectedVersion,
      @Param("now") java.time.Instant now);
}
