package com.dev.heymimic.progress.application;

import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.progress.application.port.DailyActivityRecord;
import com.dev.heymimic.progress.application.port.DailyActivityStore;
import com.dev.heymimic.progress.application.port.MistakePatternStore;
import com.dev.heymimic.progress.application.publicapi.DailyActivityView;
import com.dev.heymimic.progress.application.publicapi.DailyProgressView;
import com.dev.heymimic.progress.application.publicapi.ProgressOverviewView;
import com.dev.heymimic.progress.application.publicapi.ProgressQueries;
import com.dev.heymimic.progress.application.publicapi.ProgressRecommendationView;
import com.dev.heymimic.progress.domain.MistakeStatus;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.publicapi.SpeakingPractice;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWords;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressQueryService implements ProgressQueries {
  static final int MAX_DAILY_RANGE_DAYS = 366;
  private final DailyActivityStore activities;
  private final LearnerProfiles profiles;
  private final VocabularyWords words;
  private final MistakePatternStore mistakes;
  private final SpeakingPractice speaking;
  private final Clock clock;

  public ProgressQueryService(
      DailyActivityStore activities,
      LearnerProfiles profiles,
      VocabularyWords words,
      MistakePatternStore mistakes,
      SpeakingPractice speaking,
      Clock clock) {
    this.activities = activities;
    this.profiles = profiles;
    this.words = words;
    this.mistakes = mistakes;
    this.speaking = speaking;
    this.clock = clock;
  }

  @Override
  @Transactional(readOnly = true)
  public DailyProgressView daily(UUID userId, LocalDate from, LocalDate to) {
    validateRange(from, to);
    List<DailyActivityRecord> records = activities.find(userId, from, to);
    Map<LocalDate, DailyActivityRecord> byDate =
        records.stream()
            .collect(Collectors.toMap(DailyActivityRecord::activityDate, Function.identity()));
    List<DailyActivityView> days =
        from.datesUntil(to.plusDays(1)).map(date -> view(date, byDate.get(date))).toList();
    return new DailyProgressView(from, to, days, activities.projectedThrough(userId), false);
  }

  @Override
  @Transactional(readOnly = true)
  public ProgressOverviewView overview(UUID userId) {
    var profile = profiles.get(userId);
    ZoneId timezone = ZoneId.of(profile.timezone());
    LocalDate today = LocalDate.now(clock.withZone(timezone));
    List<DailyActivityRecord> records = activities.findAll(userId);
    Map<LocalDate, DailyActivityRecord> byDate =
        records.stream()
            .collect(Collectors.toMap(DailyActivityRecord::activityDate, Function.identity()));
    long totalSeconds = records.stream().mapToLong(DailyActivityRecord::totalSeconds).sum();
    int todaySeconds = byDate.containsKey(today) ? byDate.get(today).totalSeconds() : 0;
    return new ProgressOverviewView(
        totalSeconds / 60,
        streak(today, byDate),
        todaySeconds,
        profile.dailyMinutesGoal(),
        recommendation(userId, profile.selfAssessedLevel()),
        activities.projectedThrough(userId),
        false);
  }

  private ProgressRecommendationView recommendation(UUID userId, String level) {
    var overdue = words.find(userId, null, clock.instant(), 0, 1);
    if (overdue.totalItems() > 0) {
      return new ProgressRecommendationView(
          "vocabularyReview",
          "Review overdue vocabulary",
          overdue.items().get(0).id(),
          overdue.totalItems());
    }
    var activeMistakes = mistakes.find(userId, MistakeStatus.ACTIVE, null, 0, 1);
    if (activeMistakes.totalItems() > 0) {
      var mistake = activeMistakes.items().get(0);
      return new ProgressRecommendationView(
          "activeMistake", mistake.title(), mistake.id(), activeMistakes.totalItems());
    }
    var topics = speaking.topics(null, level);
    if (!topics.isEmpty()) {
      var topic = topics.get(0);
      return new ProgressRecommendationView(
          "speakingTopic", topic.title(), topic.id(), topics.size());
    }
    return null;
  }

  private int streak(LocalDate today, Map<LocalDate, DailyActivityRecord> byDate) {
    LocalDate cursor = today;
    DailyActivityRecord todayActivity = byDate.get(today);
    if (todayActivity == null || !todayActivity.qualifiesForStreak()) {
      cursor = today.minusDays(1);
    }
    int streak = 0;
    while (byDate.containsKey(cursor) && byDate.get(cursor).qualifiesForStreak()) {
      streak++;
      cursor = cursor.minusDays(1);
    }
    return streak;
  }

  private DailyActivityView view(LocalDate date, DailyActivityRecord record) {
    if (record == null) {
      return new DailyActivityView(date, 0, 0, 0, false, null);
    }
    return new DailyActivityView(
        date,
        record.vocabularySeconds(),
        record.speakingSeconds(),
        record.totalSeconds(),
        record.qualifiesForStreak(),
        record.timezoneSnapshot());
  }

  private void validateRange(LocalDate from, LocalDate to) {
    if (from == null || to == null || from.isAfter(to)) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_PROGRESS_DATE_RANGE",
          "Progress date range must have from on or before to");
    }
    if (ChronoUnit.DAYS.between(from, to) + 1 > MAX_DAILY_RANGE_DAYS) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "PROGRESS_DATE_RANGE_TOO_LARGE",
          "Progress date range must not exceed 366 days");
    }
  }
}
