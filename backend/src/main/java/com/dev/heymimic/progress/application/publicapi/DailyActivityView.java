package com.dev.heymimic.progress.application.publicapi;

import java.time.LocalDate;

public record DailyActivityView(
    LocalDate date,
    int vocabularySeconds,
    int speakingSeconds,
    int totalSeconds,
    boolean qualifiesForStreak,
    String timezoneSnapshot) {}
