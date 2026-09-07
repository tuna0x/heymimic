package com.dev.heymimic.platform.application.publicapi;

public record RateLimitDecision(boolean allowed, int retryAfterSeconds) {
  public static RateLimitDecision permitted() {
    return new RateLimitDecision(true, 0);
  }
}
