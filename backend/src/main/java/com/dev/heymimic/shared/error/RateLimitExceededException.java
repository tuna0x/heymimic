package com.dev.heymimic.shared.error;

import org.springframework.http.HttpStatus;

public class RateLimitExceededException extends ApiException {
  private final int retryAfterSeconds;

  public RateLimitExceededException(int retryAfterSeconds) {
    super(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT_EXCEEDED", "Too many requests");
    this.retryAfterSeconds = retryAfterSeconds;
  }

  public int retryAfterSeconds() {
    return retryAfterSeconds;
  }
}
