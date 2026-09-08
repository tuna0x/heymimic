package com.dev.heymimic.progress.application.port;

import com.dev.heymimic.progress.domain.ProgressSourceType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DailyActivityStore {
  void add(
      UUID userId,
      LocalDate activityDate,
      ProgressSourceType sourceType,
      int durationSeconds,
      String timezoneSnapshot,
      Instant projectedThrough);

  List<DailyActivityRecord> find(UUID userId, LocalDate from, LocalDate to);

  List<DailyActivityRecord> findAll(UUID userId);

  Instant projectedThrough(UUID userId);

  void deleteByUserId(UUID userId);
}
