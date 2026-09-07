package com.dev.heymimic.identity.application;

import com.dev.heymimic.platform.application.publicapi.RateLimitCounter;
import com.dev.heymimic.platform.application.publicapi.RateLimitDecision;
import com.dev.heymimic.shared.error.RateLimitExceededException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class IdentityAuthRateLimiter {
  private static final Duration LOGIN_WINDOW = Duration.ofMinutes(15);
  private static final Duration RECOVERY_WINDOW = Duration.ofHours(1);

  private final RateLimitCounter counters;
  private final Clock clock;

  public IdentityAuthRateLimiter(RateLimitCounter counters, Clock clock) {
    this.counters = counters;
    this.clock = clock;
  }

  public void checkLogin(String email, String clientAddress) {
    reject(
        counters.check("LOGIN_EMAIL", hash(normalize(email)), 10, LOGIN_WINDOW, clock.instant()));
    reject(counters.check("LOGIN_IP", hash(clientAddress), 10, LOGIN_WINDOW, clock.instant()));
  }

  public void recordLoginFailure(String email, String clientAddress) {
    reject(
        counters.increment(
            "LOGIN_EMAIL", hash(normalize(email)), 10, LOGIN_WINDOW, clock.instant()));
    reject(counters.increment("LOGIN_IP", hash(clientAddress), 10, LOGIN_WINDOW, clock.instant()));
  }

  public void guardRecovery(String email, String clientAddress) {
    reject(
        counters.increment(
            "RECOVERY_EMAIL", hash(normalize(email)), 3, RECOVERY_WINDOW, clock.instant()));
    reject(
        counters.increment(
            "RECOVERY_IP", hash(clientAddress), 20, RECOVERY_WINDOW, clock.instant()));
  }

  private void reject(RateLimitDecision decision) {
    if (!decision.allowed()) throw new RateLimitExceededException(decision.retryAfterSeconds());
  }

  private String normalize(String value) {
    return value.trim().toLowerCase(Locale.ROOT);
  }

  private String hash(String value) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is unavailable", exception);
    }
  }
}
