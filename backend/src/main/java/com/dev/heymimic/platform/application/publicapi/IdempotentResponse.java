package com.dev.heymimic.platform.application.publicapi;

import java.util.Objects;

public record IdempotentResponse(int status, String bodyJson, boolean replayed) {
  public IdempotentResponse {
    Objects.requireNonNull(bodyJson, "bodyJson is required");
    if (status < 200 || status > 599) throw new IllegalArgumentException("invalid HTTP status");
  }

  public static IdempotentResponse fresh(int status, String bodyJson) {
    return new IdempotentResponse(status, bodyJson, false);
  }

  public IdempotentResponse asReplay() {
    return new IdempotentResponse(status, bodyJson, true);
  }
}
