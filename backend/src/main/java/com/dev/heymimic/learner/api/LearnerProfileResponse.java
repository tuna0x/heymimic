package com.dev.heymimic.learner.api;

import java.util.UUID;

public record LearnerProfileResponse(
    UUID id,
    String name,
    String email,
    boolean emailVerified,
    String targetLanguage,
    String goal,
    String selfAssessedLevel,
    Integer dailyMinutesGoal,
    String timezone,
    boolean onboardingCompleted,
    long version) {}
