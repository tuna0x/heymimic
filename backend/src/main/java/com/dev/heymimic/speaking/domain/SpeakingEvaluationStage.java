package com.dev.heymimic.speaking.domain;

public enum SpeakingEvaluationStage {
  QUEUED("queued"),
  TRANSCRIBING("transcribing"),
  FEEDBACK("feedback"),
  COMPLETED("completed"),
  FAILED("failed");

  private final String apiValue;

  SpeakingEvaluationStage(String apiValue) {
    this.apiValue = apiValue;
  }

  public String apiValue() {
    return apiValue;
  }
}
