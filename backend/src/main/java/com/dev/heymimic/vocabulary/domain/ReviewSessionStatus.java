package com.dev.heymimic.vocabulary.domain;

import java.util.Locale;

public enum ReviewSessionStatus {
  IN_PROGRESS,
  COMPLETED,
  ABANDONED;

  public String apiValue() {
    return name().toLowerCase(Locale.ROOT);
  }
}
