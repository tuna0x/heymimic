package com.dev.heymimic.identity.infrastructure.security;

import com.dev.heymimic.identity.application.port.SessionStore;
import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.domain.UserStatus;
import java.time.Clock;
import java.util.UUID;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class ActiveSessionJwtValidator implements OAuth2TokenValidator<Jwt> {
  private static final OAuth2Error INVALID_SESSION =
      new OAuth2Error("invalid_token", "The session is no longer active", null);

  private final SessionStore sessions;
  private final UserStore users;
  private final Clock clock;

  public ActiveSessionJwtValidator(SessionStore sessions, UserStore users, Clock clock) {
    this.sessions = sessions;
    this.users = users;
    this.clock = clock;
  }

  @Override
  public OAuth2TokenValidatorResult validate(Jwt jwt) {
    try {
      UUID userId = UUID.fromString(jwt.getSubject());
      UUID familyId = UUID.fromString(jwt.getClaimAsString("sid"));
      Long authVersion = jwt.getClaim("av");
      boolean userActive =
          users
              .findById(userId)
              .filter(user -> user.status() == UserStatus.ACTIVE)
              .filter(user -> authVersion != null && user.authVersion() == authVersion)
              .isPresent();
      return userActive && sessions.isFamilyActive(familyId, userId, clock.instant())
          ? OAuth2TokenValidatorResult.success()
          : OAuth2TokenValidatorResult.failure(INVALID_SESSION);
    } catch (RuntimeException exception) {
      return OAuth2TokenValidatorResult.failure(INVALID_SESSION);
    }
  }
}
