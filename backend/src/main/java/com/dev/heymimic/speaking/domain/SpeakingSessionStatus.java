package com.dev.heymimic.speaking.domain;

public enum SpeakingSessionStatus {
  IN_PROGRESS("inProgress"),
  COMPLETED("completed"),
  ABANDONED("abandoned");

  private final String apiValue;

  SpeakingSessionStatus(String apiValue) {
    this.apiValue = apiValue;
  }

  public String apiValue() {
    return apiValue;
  }
}
