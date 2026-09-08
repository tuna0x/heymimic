package com.dev.heymimic.speaking.domain;

public enum SpeakingEvaluationStatus {
  QUEUED("queued"),
  RUNNING("running"),
  COMPLETED("completed"),
  FAILED("failed");

  private final String apiValue;

  SpeakingEvaluationStatus(String apiValue) {
    this.apiValue = apiValue;
  }

  public String apiValue() {
    return apiValue;
  }
}
