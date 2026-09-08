package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.AccessTokenIssuer;
import com.dev.heymimic.identity.application.port.IssuedAccessToken;
import com.dev.heymimic.identity.application.port.RotationResult;
import com.dev.heymimic.identity.application.port.RotationStatus;
import com.dev.heymimic.identity.application.port.SessionStore;
import com.dev.heymimic.identity.application.port.UserRecord;
import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.application.publicapi.AuthTokens;
import com.dev.heymimic.identity.application.publicapi.IdentityAuthentication;
import com.dev.heymimic.identity.application.publicapi.LoginUser;
import com.dev.heymimic.identity.domain.UserStatus;
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
public class IdentityAuthenticationService implements IdentityAuthentication {
  private static final Duration SESSION_TTL = Duration.ofDays(30);
  private static final Duration REFRESH_TTL = Duration.ofDays(30);

  private final UserStore users;
  private final SessionStore sessions;
  private final AccessTokenIssuer accessTokens;
  private final PasswordEncoder passwords;
  private final IdentityAuthRateLimiter rateLimiter;
  private final Clock clock;
  private final SecureRandom secureRandom = new SecureRandom();
  private final String dummyPasswordHash;

  public IdentityAuthenticationService(
      UserStore users,
      SessionStore sessions,
      AccessTokenIssuer accessTokens,
      PasswordEncoder passwords,
      IdentityAuthRateLimiter rateLimiter,
      Clock clock) {
    this.users = users;
    this.sessions = sessions;
    this.accessTokens = accessTokens;
    this.passwords = passwords;
    this.rateLimiter = rateLimiter;
    this.clock = clock;
    this.dummyPasswordHash = passwords.encode(UUID.randomUUID().toString());
  }

  @Override
  @Transactional
  public AuthTokens login(LoginUser command) {
    String email = command.email().trim().toLowerCase(Locale.ROOT);
    rateLimiter.checkLogin(email, command.clientAddress());
    UserRecord user = users.findByEmail(email).orElse(null);
    String expectedHash = user == null ? dummyPasswordHash : user.passwordHash();
    if (!passwords.matches(command.password(), expectedHash)
        || user == null
        || user.status() != UserStatus.ACTIVE) {
      rateLimiter.recordLoginFailure(email, command.clientAddress());
      throw invalidCredentials();
    }

    Instant now = clock.instant();
    UUID familyId = UUID.randomUUID();
    String refreshToken = newRefreshToken();
    sessions.create(
        familyId,
        UUID.randomUUID(),
        user.id(),
        hash(refreshToken),
        now.plus(SESSION_TTL),
        now.plus(REFRESH_TTL),
        now);
    return tokensFor(user, familyId, refreshToken, now);
  }

  @Override
  @Transactional(noRollbackFor = RefreshReuseException.class)
  public AuthTokens refresh(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) throw invalidRefreshToken();
    Instant now = clock.instant();
    String successor = newRefreshToken();
    RotationResult rotation =
        sessions.rotate(
            hash(refreshToken), UUID.randomUUID(), hash(successor), now.plus(REFRESH_TTL), now);
    if (rotation.status() == RotationStatus.REUSED) {
      throw new RefreshReuseException();
    }
    if (rotation.status() != RotationStatus.ROTATED) throw invalidRefreshToken();

    UserRecord user =
        users
            .findById(rotation.userId())
            .filter(value -> value.status() == UserStatus.ACTIVE)
            .orElseThrow(this::invalidRefreshToken);
    return tokensFor(user, rotation.familyId(), successor, now);
  }

  @Override
  @Transactional
  public void logout(String refreshToken) {
    if (refreshToken != null && !refreshToken.isBlank()) {
      sessions.revokeFamilyByTokenHash(hash(refreshToken), clock.instant());
    }
  }

  @Override
  @Transactional
  public void changePassword(UUID userId, String currentPassword, String newPassword) {
    UserRecord user =
        users
            .findById(userId)
            .filter(value -> value.status() == UserStatus.ACTIVE)
            .orElseThrow(this::invalidCurrentPassword);
    if (!passwords.matches(currentPassword, user.passwordHash())) {
      throw invalidCurrentPassword();
    }
    if (passwords.matches(newPassword, user.passwordHash())) {
      throw new ApiException(
          HttpStatus.UNPROCESSABLE_CONTENT,
          "PASSWORD_UNCHANGED",
          "New password must be different from the current password");
    }

    Instant now = clock.instant();
    users.changePassword(userId, passwords.encode(newPassword), now);
    sessions.revokeAllForUser(userId, now);
  }

  private AuthTokens tokensFor(
      UserRecord user, UUID familyId, String refreshToken, Instant issuedAt) {
    IssuedAccessToken access =
        accessTokens.issue(
            user.id(), familyId, user.authVersion(), user.verifiedAt() != null, issuedAt);
    return new AuthTokens(
        access.value(),
        Duration.between(issuedAt, access.expiresAt()).toSeconds(),
        refreshToken,
        user.id(),
        user.emailNormalized(),
        user.verifiedAt() != null);
  }

  private String newRefreshToken() {
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

  private ApiException invalidCredentials() {
    return new ApiException(
        HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email or password is invalid");
  }

  private ApiException invalidRefreshToken() {
    return new ApiException(
        HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Refresh token is invalid");
  }

  private ApiException invalidCurrentPassword() {
    return new ApiException(
        HttpStatus.UNAUTHORIZED, "INVALID_CURRENT_PASSWORD", "Current password is invalid");
  }

  private static final class RefreshReuseException extends ApiException {
    private RefreshReuseException() {
      super(
          HttpStatus.UNAUTHORIZED,
          "REFRESH_TOKEN_REUSED",
          "Refresh token reuse detected; the session has been revoked");
    }
  }
}
