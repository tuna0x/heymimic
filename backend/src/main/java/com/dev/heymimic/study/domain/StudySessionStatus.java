package com.dev.heymimic.study.domain;

public enum StudySessionStatus {
  IN_PROGRESS("inProgress"),
  COMPLETED("completed"),
  ABANDONED("abandoned");

  private final String apiValue;

  StudySessionStatus(String apiValue) {
    this.apiValue = apiValue;
  }

  public String apiValue() {
    return apiValue;
  }
}
