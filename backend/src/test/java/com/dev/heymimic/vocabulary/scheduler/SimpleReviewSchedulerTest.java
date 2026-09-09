package com.dev.heymimic.vocabulary.scheduler;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.vocabulary.domain.ReviewRating;
import com.dev.heymimic.vocabulary.domain.ReviewWordState;
import com.dev.heymimic.vocabulary.domain.SimpleReviewScheduler;
import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class SimpleReviewSchedulerTest {
  private static final Instant NOW = Instant.parse("2026-09-08T01:00:00Z");

  @Test
  void rememberedIncreasesMasteryAndDoublesBoundedInterval() {
    var before = ReviewWordState.from(76, VocabularyStatus.REVIEWING, 20, NOW);
    var after = SimpleReviewScheduler.rate(before, ReviewRating.REMEMBERED, NOW);
    assertThat(after.mastery()).isEqualTo(88);
    assertThat(after.status()).isEqualTo(VocabularyStatus.MASTERED);
    assertThat(after.intervalDays()).isEqualTo(30);
    assertThat(after.nextReviewAt()).isEqualTo(NOW.plusSeconds(30L * 86_400));
  }

  @Test
  void needsReviewDecreasesMasteryAndResetsInterval() {
    var before = ReviewWordState.from(5, VocabularyStatus.REVIEWING, 8, NOW);
    var after = SimpleReviewScheduler.rate(before, ReviewRating.NEEDS_REVIEW, NOW);
    assertThat(after.mastery()).isZero();
    assertThat(after.status()).isEqualTo(VocabularyStatus.NEW);
    assertThat(after.intervalDays()).isEqualTo(1);
    assertThat(after.nextReviewAt()).isEqualTo(NOW.plusSeconds(86_400));
  }
}
