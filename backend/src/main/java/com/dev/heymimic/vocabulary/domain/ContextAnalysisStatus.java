package com.dev.heymimic.vocabulary.domain;

import java.util.Locale;

public enum ContextAnalysisStatus {
  PENDING,
  COMPLETED,
  FAILED;

  public String apiValue() {
    return name().toLowerCase(Locale.ROOT);
  }
}
