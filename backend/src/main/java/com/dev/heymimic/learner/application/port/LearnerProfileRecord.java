package com.dev.heymimic.learner.application.port;

import java.time.Instant;
import java.util.UUID;

public record LearnerProfileRecord(
    UUID userId,
    String name,
    String targetLanguage,
    String goal,
    String selfAssessedLevel,
    Integer dailyMinutesGoal,
    String timezone,
    Instant onboardingCompletedAt,
    long version) {}
