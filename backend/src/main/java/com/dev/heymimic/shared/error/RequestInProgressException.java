package com.dev.heymimic.shared.error;

import org.springframework.http.HttpStatus;

public class RequestInProgressException extends ApiException {
  private final int retryAfterSeconds;

  public RequestInProgressException(int retryAfterSeconds) {
    super(
        HttpStatus.CONFLICT,
        "REQUEST_IN_PROGRESS",
        "A request with this idempotency key is still in progress");
    this.retryAfterSeconds = retryAfterSeconds;
  }

  public int retryAfterSeconds() {
    return retryAfterSeconds;
  }
}
