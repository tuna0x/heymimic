package com.dev.heymimic.platform.application.publicapi;

import java.time.Duration;
import java.time.Instant;

public interface RateLimitCounter {
  RateLimitDecision check(
      String scope, String subjectHash, int limit, Duration window, Instant now);

  RateLimitDecision increment(
      String scope, String subjectHash, int limit, Duration window, Instant now);
}
