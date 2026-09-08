package com.dev.heymimic.progress.domain;

public enum MistakeStatus {
  ACTIVE,
  RESOLVED,
  IGNORED;

  public String apiValue() {
    return name().toLowerCase(java.util.Locale.ROOT);
  }
}
