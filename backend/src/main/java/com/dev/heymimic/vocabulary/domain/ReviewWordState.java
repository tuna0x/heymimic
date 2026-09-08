package com.dev.heymimic.vocabulary.domain;

import java.time.Instant;

public record ReviewWordState(
    int schemaVersion,
    int mastery,
    VocabularyStatus status,
    int intervalDays,
    Instant nextReviewAt) {
  public static ReviewWordState from(
      int mastery, VocabularyStatus status, int intervalDays, Instant nextReviewAt) {
    return new ReviewWordState(1, mastery, status, intervalDays, nextReviewAt);
  }
}
