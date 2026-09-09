package com.dev.heymimic.learner.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "learner_profiles")
class LearnerProfileEntity {
  @Id
  @Column(name = "user_id")
  private UUID userId;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(name = "target_language", nullable = false, length = 16)
  private String targetLanguage;

  @Column(length = 50)
  private String goal;

  @Column(name = "self_assessed_level", length = 20)
  private String selfAssessedLevel;

  @Column(name = "daily_minutes_goal")
  private Integer dailyMinutesGoal;

  @Column(nullable = false, length = 64)
  private String timezone;

  @Column(name = "onboarding_completed_at")
  private Instant onboardingCompletedAt;

  @Version private long version;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected LearnerProfileEntity() {}

  LearnerProfileEntity(UUID userId, String name, String timezone, Instant now) {
    this.userId = userId;
    this.name = name;
    this.targetLanguage = "en";
    this.timezone = timezone;
    this.createdAt = now;
    this.updatedAt = now;
  }

  UUID userId() {
    return userId;
  }

  String name() {
    return name;
  }

  String targetLanguage() {
    return targetLanguage;
  }

  String goal() {
    return goal;
  }

  String selfAssessedLevel() {
    return selfAssessedLevel;
  }

  Integer dailyMinutesGoal() {
    return dailyMinutesGoal;
  }

  String timezone() {
    return timezone;
  }

  Instant onboardingCompletedAt() {
    return onboardingCompletedAt;
  }

  long version() {
    return version;
  }
}
