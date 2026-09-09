package com.dev.heymimic.learner.application.publicapi;

public record CompleteOnboarding(
    String goal,
    String selfAssessedLevel,
    int dailyMinutesGoal,
    String targetLanguage,
    String timezone) {}
