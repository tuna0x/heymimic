package com.dev.heymimic.vocabulary.domain;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public final class SimpleReviewScheduler {
  private SimpleReviewScheduler() {}

  public static ReviewWordState rate(ReviewWordState before, ReviewRating rating, Instant now) {
    int mastery =
        rating == ReviewRating.REMEMBERED
            ? Math.min(100, before.mastery() + 12)
            : Math.max(0, before.mastery() - 8);
    int interval =
        rating == ReviewRating.REMEMBERED
            ? Math.min(30, before.intervalDays() == 0 ? 1 : before.intervalDays() * 2)
            : 1;
    VocabularyStatus status =
        mastery == 0
            ? VocabularyStatus.NEW
            : mastery < 80 ? VocabularyStatus.REVIEWING : VocabularyStatus.MASTERED;
    return ReviewWordState.from(mastery, status, interval, now.plus(interval, ChronoUnit.DAYS));
  }
}
