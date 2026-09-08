package com.dev.heymimic.speaking.domain;

public enum AttemptProcessingState {
  NOT_REQUESTED("notRequested"),
  QUEUED("queued"),
  RUNNING("running"),
  COMPLETED("completed"),
  FAILED("failed");

  private final String apiValue;

  AttemptProcessingState(String apiValue) {
    this.apiValue = apiValue;
  }

  public String apiValue() {
    return apiValue;
  }
}
