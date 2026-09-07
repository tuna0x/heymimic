package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.application.publicapi.RegisterUser;
import com.dev.heymimic.identity.application.publicapi.RegisteredUser;
import com.dev.heymimic.identity.application.publicapi.UserRegistration;
import com.dev.heymimic.identity.application.publicapi.VerificationWorkflow;
import com.dev.heymimic.learner.application.publicapi.CreateLearnerProfile;
import com.dev.heymimic.learner.application.publicapi.LearnerProfileCreator;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.Locale;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdentityRegistrationService implements UserRegistration {
  private final UserStore users;
  private final LearnerProfileCreator profiles;
  private final PasswordEncoder passwordEncoder;
  private final VerificationWorkflow verification;
  private final Clock clock;

  public IdentityRegistrationService(
      UserStore users,
      LearnerProfileCreator profiles,
      PasswordEncoder passwordEncoder,
      VerificationWorkflow verification,
      Clock clock) {
    this.users = users;
    this.profiles = profiles;
    this.passwordEncoder = passwordEncoder;
    this.verification = verification;
    this.clock = clock;
  }

  @Override
  @Transactional
  public RegisteredUser register(RegisterUser command) {
    String email = command.email().trim().toLowerCase(Locale.ROOT);
    String name = command.name().trim();
    validateTimezone(command.timezone());
    if (users.existsByEmail(email)) throw emailConflict();

    UUID userId = UUID.randomUUID();
    try {
      users.create(userId, email, passwordEncoder.encode(command.password()), clock.instant());
    } catch (DataIntegrityViolationException exception) {
      throw emailConflict();
    }
    profiles.create(new CreateLearnerProfile(userId, name, command.timezone()));
    verification.schedule(userId);
    return new RegisteredUser(userId, true);
  }

  private void validateTimezone(String timezone) {
    try {
      ZoneId.of(timezone);
    } catch (DateTimeException exception) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TIMEZONE", "Timezone is invalid");
    }
  }

  private ApiException emailConflict() {
    return new ApiException(
        HttpStatus.CONFLICT, "EMAIL_ALREADY_REGISTERED", "An account already uses this email");
  }
}
