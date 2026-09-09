package com.dev.heymimic.progress.application.publicapi;

import java.time.Instant;

public record ProgressOverviewView(
    long totalMinutes,
    int streakDays,
    int todaySeconds,
    Integer dailyGoalMinutes,
    ProgressRecommendationView recommendation,
    Instant projectedThrough,
    boolean pendingProjection) {}
