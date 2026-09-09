package com.dev.heymimic.speaking.application.port;

public enum SpeakingProviderFailure {
  TIMEOUT(true),
  RATE_LIMITED(true),
  UNAVAILABLE(true),
  AUTHENTICATION_FAILED(false),
  REQUEST_REJECTED(false);

  private final boolean retryable;

  SpeakingProviderFailure(boolean retryable) {
    this.retryable = retryable;
  }

  public boolean retryable() {
    return retryable;
  }
}
