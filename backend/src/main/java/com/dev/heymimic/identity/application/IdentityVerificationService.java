package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.EmailTokenRecord;
import com.dev.heymimic.identity.application.port.EmailTokenStore;
import com.dev.heymimic.identity.application.port.UserRecord;
import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.application.publicapi.PreparedVerification;
import com.dev.heymimic.identity.application.publicapi.VerificationWorkflow;
import com.dev.heymimic.identity.domain.EmailTokenPurpose;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdentityVerificationService implements VerificationWorkflow {
  private static final Duration TOKEN_TTL = Duration.ofHours(24);

  private final UserStore users;
  private final EmailTokenStore tokens;
  private final JobQueue jobs;
  private final IdentityAuthRateLimiter rateLimiter;
  private final Clock clock;
  private final SecureRandom secureRandom = new SecureRandom();

  public IdentityVerificationService(
      UserStore users,
      EmailTokenStore tokens,
      JobQueue jobs,
      IdentityAuthRateLimiter rateLimiter,
      Clock clock) {
    this.users = users;
    this.tokens = tokens;
    this.jobs = jobs;
    this.rateLimiter = rateLimiter;
    this.clock = clock;
  }

  @Override
  public void schedule(UUID userId) {
    jobs.enqueue(
        new EnqueueJob(
            userId,
            VERIFICATION_EMAIL_JOB,
            UUID.randomUUID(),
            1,
            "{\"purpose\":\"VERIFY\"}",
            clock.instant()));
  }

  @Override
  @Transactional
  public void resend(String email, String clientAddress) {
    rateLimiter.guardRecovery(email, clientAddress);
    users
        .findByEmail(email.trim().toLowerCase(Locale.ROOT))
        .filter(user -> user.verifiedAt() == null)
        .ifPresent(user -> schedule(user.id()));
  }

  @Override
  @Transactional
  public PreparedVerification prepareDelivery(UUID userId) {
    UserRecord user =
        users
            .findById(userId)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User no longer exists"));
    String rawToken = newToken();
    Instant now = clock.instant();
    tokens.replaceActive(
        UUID.randomUUID(),
        userId,
        EmailTokenPurpose.VERIFY,
        hash(rawToken),
        now.plus(TOKEN_TTL),
        now);
    return new PreparedVerification(user.emailNormalized(), rawToken);
  }

  @Override
  @Transactional
  public void verify(String token) {
    Instant now = clock.instant();
    EmailTokenRecord record =
        tokens.lockByHash(hash(token)).orElseThrow(this::invalidVerificationToken);
    if (record.purpose() != EmailTokenPurpose.VERIFY
        || record.consumedAt() != null
        || !record.expiresAt().isAfter(now)) {
      throw invalidVerificationToken();
    }
    tokens.consume(record.id(), now);
    users.markVerified(record.userId(), now);
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

  private ApiException invalidVerificationToken() {
    return new ApiException(
        HttpStatus.UNPROCESSABLE_CONTENT,
        "INVALID_VERIFICATION_TOKEN",
        "Verification token is invalid or expired");
  }
}
