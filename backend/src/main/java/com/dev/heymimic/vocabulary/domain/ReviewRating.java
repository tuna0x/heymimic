package com.dev.heymimic.vocabulary.domain;

import java.util.Locale;

public enum ReviewRating {
  REMEMBERED,
  NEEDS_REVIEW;

  public static ReviewRating fromApi(String value) {
    if (value == null) throw new IllegalArgumentException("Review rating is required");
    return switch (value.trim().toLowerCase(Locale.ROOT)) {
      case "remembered" -> REMEMBERED;
      case "needsreview", "needs_review", "needs-review" -> NEEDS_REVIEW;
      default -> throw new IllegalArgumentException("Unsupported review rating");
    };
  }
}
