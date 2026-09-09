package com.dev.heymimic.learner.application.publicapi;

import java.util.UUID;

public record LearnerProfileView(
    UUID id,
    String name,
    String targetLanguage,
    String goal,
    String selfAssessedLevel,
    Integer dailyMinutesGoal,
    String timezone,
    boolean onboardingCompleted,
    long version) {}
