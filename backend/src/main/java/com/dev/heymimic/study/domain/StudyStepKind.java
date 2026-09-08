package com.dev.heymimic.study.domain;

import java.util.Locale;

public enum StudyStepKind {
  VOCABULARY("vocabulary"),
  SPEAKING("speaking");

  private final String apiValue;

  StudyStepKind(String apiValue) {
    this.apiValue = apiValue;
  }

  public String apiValue() {
    return apiValue;
  }

  public static StudyStepKind fromApiValue(String value) {
    if (value == null) throw new IllegalArgumentException("Study step kind is required");
    return switch (value.trim().toLowerCase(Locale.ROOT)) {
      case "vocabulary" -> VOCABULARY;
      case "speaking" -> SPEAKING;
      default -> throw new IllegalArgumentException("Study step kind is invalid");
    };
  }
}
