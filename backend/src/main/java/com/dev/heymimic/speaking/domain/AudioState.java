package com.dev.heymimic.speaking.domain;

public enum AudioState {
  AWAITING_UPLOAD("awaitingUpload"),
  AVAILABLE("available"),
  DELETED("deleted");

  private final String apiValue;

  AudioState(String apiValue) {
    this.apiValue = apiValue;
  }

  public String apiValue() {
    return apiValue;
  }
}
