package com.dev.heymimic.learner.application.publicapi;

public record UpdateLearnerProfile(
    String name, String goal, Integer dailyMinutesGoal, String timezone, long expectedVersion) {}
