package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.EmailTokenRecord;
import com.dev.heymimic.identity.application.port.EmailTokenStore;
import com.dev.heymimic.identity.application.port.SessionStore;
import com.dev.heymimic.identity.application.port.UserRecord;
import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.application.publicapi.PasswordRecoveryWorkflow;
import com.dev.heymimic.identity.application.publicapi.PreparedPasswordReset;
import com.dev.heymimic.identity.domain.EmailTokenPurpose;
import com.dev.heymimic.identity.domain.UserStatus;
import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.shared.error.ApiException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdentityPasswordRecoveryService implements PasswordRecoveryWorkflow {
  private static final Duration TOKEN_TTL = Duration.ofMinutes(30);

  private final UserStore users;
  private final SessionStore sessions;
  private final EmailTokenStore tokens;
  private final JobQueue jobs;
  private final PasswordEncoder passwords;
  private final IdentityAuthRateLimiter rateLimiter;
  private final Clock clock;
  private final SecureRandom secureRandom = new SecureRandom();

  public IdentityPasswordRecoveryService(
      UserStore users,
      SessionStore sessions,
      EmailTokenStore tokens,
      JobQueue jobs,
      PasswordEncoder passwords,
      IdentityAuthRateLimiter rateLimiter,
      Clock clock) {
    this.users = users;
    this.sessions = sessions;
    this.tokens = tokens;
    this.jobs = jobs;
    this.passwords = passwords;
    this.rateLimiter = rateLimiter;
    this.clock = clock;
  }

  @Override
  @Transactional
  public void requestReset(String email, String clientAddress) {
    rateLimiter.guardRecovery(email, clientAddress);
    users
        .findByEmail(email.trim().toLowerCase(Locale.ROOT))
        .filter(user -> user.status() == UserStatus.ACTIVE)
        .ifPresent(
            user ->
                jobs.enqueue(
                    new EnqueueJob(
                        user.id(),
                        PASSWORD_RESET_EMAIL_JOB,
                        UUID.randomUUID(),
                        1,
                        "{\"purpose\":\"RESET\"}",
                        clock.instant())));
  }

  @Override
  @Transactional
  public PreparedPasswordReset prepareDelivery(UUID userId) {
    UserRecord user =
        users
            .findById(userId)
            .filter(value -> value.status() == UserStatus.ACTIVE)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User no longer exists"));
    String rawToken = newToken();
    Instant now = clock.instant();
    tokens.replaceActive(
        UUID.randomUUID(),
        userId,
        EmailTokenPurpose.RESET,
        hash(rawToken),
        now.plus(TOKEN_TTL),
        now);
    return new PreparedPasswordReset(user.emailNormalized(), rawToken);
  }

  @Override
  @Transactional
  public void resetPassword(String token, String newPassword) {
    Instant now = clock.instant();
    EmailTokenRecord record = tokens.lockByHash(hash(token)).orElseThrow(this::invalidResetToken);
    if (record.purpose() != EmailTokenPurpose.RESET
        || record.consumedAt() != null
        || !record.expiresAt().isAfter(now)) {
      throw invalidResetToken();
    }
    UserRecord user =
        users
            .findById(record.userId())
            .filter(value -> value.status() == UserStatus.ACTIVE)
            .orElseThrow(this::invalidResetToken);

    users.changePassword(user.id(), passwords.encode(newPassword), now);
    sessions.revokeAllForUser(user.id(), now);
    tokens.consume(record.id(), now);
  }

  private String newToken() {
    byte[] bytes = new byte[32];
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
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

  private ApiException invalidResetToken() {
    return new ApiException(
        HttpStatus.UNPROCESSABLE_CONTENT,
        "INVALID_RESET_TOKEN",
        "Password reset token is invalid or expired");
  }
}
