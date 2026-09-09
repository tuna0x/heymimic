package com.dev.heymimic.platform.infrastructure.ai;

public enum AnthropicFailure {
  TIMEOUT(true),
  RATE_LIMITED(true),
  UNAVAILABLE(true),
  AUTHENTICATION_FAILED(false),
  REQUEST_REJECTED(false);

  private final boolean retryable;

  AnthropicFailure(boolean retryable) {
    this.retryable = retryable;
  }

  public boolean retryable() {
    return retryable;
  }
}
