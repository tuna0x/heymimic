package com.dev.heymimic.progress.application.port;

import java.time.Instant;
import java.time.LocalDate;

public record DailyActivityRecord(
    LocalDate activityDate,
    int vocabularySeconds,
    int speakingSeconds,
    boolean qualifiesForStreak,
    String timezoneSnapshot,
    Instant projectedThrough) {
  public int totalSeconds() {
    return vocabularySeconds + speakingSeconds;
  }
}
