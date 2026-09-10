package com.dev.heymimic.progress.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.dev.heymimic.learner.application.publicapi.LearnerProfileView;
import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.progress.application.port.DailyActivityRecord;
import com.dev.heymimic.progress.application.port.DailyActivityStore;
import com.dev.heymimic.progress.application.port.MistakePage;
import com.dev.heymimic.progress.application.port.MistakePatternStore;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.publicapi.SpeakingPractice;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordPageView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWords;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ProgressQueryServiceTest {
  private static final Instant NOW = Instant.parse("2026-09-08T17:30:00Z");
  private final UUID userId = UUID.randomUUID();
  private final DailyActivityStore activities = mock(DailyActivityStore.class);
  private final LearnerProfiles profiles = mock(LearnerProfiles.class);
  private final VocabularyWords words = mock(VocabularyWords.class);
  private final MistakePatternStore mistakes = mock(MistakePatternStore.class);
  private final SpeakingPractice speaking = mock(SpeakingPractice.class);
  private final ProgressQueryService service =
      new ProgressQueryService(
          activities, profiles, words, mistakes, speaking, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void dailyReturnsDenseDateSeriesAndProjectionMetadata() {
    LocalDate from = LocalDate.parse("2026-09-07");
    LocalDate to = LocalDate.parse("2026-09-09");
    when(activities.find(userId, from, to))
        .thenReturn(
            List.of(
                activity("2026-09-07", 40, 20, true, NOW.minusSeconds(30)),
                activity("2026-09-09", 12, 0, false, NOW)));
    when(activities.projectedThrough(userId)).thenReturn(NOW);

    var result = service.daily(userId, from, to);

    assertThat(result.days()).hasSize(3);
    assertThat(result.days().get(0).totalSeconds()).isEqualTo(60);
    assertThat(result.days().get(1).totalSeconds()).isZero();
    assertThat(result.days().get(1).timezoneSnapshot()).isNull();
    assertThat(result.days().get(2).totalSeconds()).isEqualTo(12);
    assertThat(result.projectedThrough()).isEqualTo(NOW);
    assertThat(result.pendingProjection()).isFalse();
  }

  @Test
  void overviewUsesProfileTimezoneAndAllowsStreakToEndYesterday() {
    emptyRecommendations();
    when(profiles.get(userId))
        .thenReturn(
            new LearnerProfileView(
                UUID.randomUUID(),
                "Tuna",
                "English",
                "Conversation",
                "B1",
                15,
                "Asia/Bangkok",
                true,
                1));
    when(activities.findAll(userId))
        .thenReturn(
            List.of(
                activity("2026-09-07", 60, 0, true, NOW.minusSeconds(60)),
                activity("2026-09-08", 30, 30, true, NOW.minusSeconds(30)),
                activity("2026-09-09", 20, 10, false, NOW)));
    when(activities.projectedThrough(userId)).thenReturn(NOW);

    var result = service.overview(userId);

    assertThat(result.streakDays()).isEqualTo(2);
    assertThat(result.todaySeconds()).isEqualTo(30);
    assertThat(result.totalMinutes()).isEqualTo(2);
    assertThat(result.dailyGoalMinutes()).isEqualTo(15);
    assertThat(result.projectedThrough()).isEqualTo(NOW);
  }

  @Test
  void overviewReturnsZeroWhenYesterdayBreaksTheStreak() {
    emptyRecommendations();
    when(profiles.get(userId))
        .thenReturn(
            new LearnerProfileView(
                UUID.randomUUID(), null, null, null, null, null, "UTC", false, 0));
    when(activities.findAll(userId)).thenReturn(List.of(activity("2026-09-06", 60, 0, true, NOW)));

    assertThat(service.overview(userId).streakDays()).isZero();
  }

  @Test
  void recommendationPrioritizesOverdueVocabulary() {
    UUID wordId = UUID.randomUUID();
    var word = mock(com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordView.class);
    when(word.id()).thenReturn(wordId);
    when(profiles.get(userId))
        .thenReturn(
            new LearnerProfileView(
                UUID.randomUUID(), "Tuna", "English", null, "B1", 15, "UTC", true, 1));
    when(activities.findAll(userId)).thenReturn(List.of());
    when(words.find(userId, null, NOW, 0, 1))
        .thenReturn(new VocabularyWordPageView(List.of(word), 0, 1, 3, 3));

    var recommendation = service.overview(userId).recommendation();

    assertThat(recommendation.kind()).isEqualTo("vocabularyReview");
    assertThat(recommendation.targetId()).isEqualTo(wordId);
    assertThat(recommendation.availableCount()).isEqualTo(3);
  }

  @Test
  void rejectsRangesLongerThan366Days() {
    assertThatThrownBy(
            () ->
                service.daily(userId, LocalDate.parse("2025-01-01"), LocalDate.parse("2026-01-02")))
        .isInstanceOf(ApiException.class)
        .extracting(exception -> ((ApiException) exception).code())
        .isEqualTo("PROGRESS_DATE_RANGE_TOO_LARGE");
  }

  private DailyActivityRecord activity(
      String date,
      int vocabularySeconds,
      int speakingSeconds,
      boolean qualifies,
      Instant projectedThrough) {
    return new DailyActivityRecord(
        LocalDate.parse(date),
        vocabularySeconds,
        speakingSeconds,
        qualifies,
        "Asia/Bangkok",
        projectedThrough);
  }

  private void emptyRecommendations() {
    when(words.find(userId, null, NOW, 0, 1))
        .thenReturn(new VocabularyWordPageView(List.of(), 0, 1, 0, 0));
    when(mistakes.find(userId, com.dev.heymimic.progress.domain.MistakeStatus.ACTIVE, null, 0, 1))
        .thenReturn(new MistakePage<>(List.of(), 0, 1, 0, 0));
    when(speaking.topics(null, "B1")).thenReturn(List.of());
    when(speaking.topics(null, null)).thenReturn(List.of());
  }

  @Test
  void onboardingLevelUsesSupportedTopicBand() {
    emptyRecommendations();
    when(profiles.get(userId))
        .thenReturn(
            new LearnerProfileView(
                UUID.randomUUID(),
                "Tuna",
                "en",
                "conversation",
                "intermediate",
                15,
                "UTC",
                true,
                1));
    when(activities.findAll(userId)).thenReturn(List.of());
    service.overview(userId);
    org.mockito.Mockito.verify(speaking).topics(null, "B1-B2");
  }
}
