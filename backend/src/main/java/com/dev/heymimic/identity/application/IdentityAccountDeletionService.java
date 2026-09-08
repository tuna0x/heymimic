package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.DeletionCheckpointStore;
import com.dev.heymimic.identity.application.port.SessionStore;
import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.application.publicapi.AccountDeletion;
import com.dev.heymimic.identity.domain.UserStatus;
import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdentityAccountDeletionService implements AccountDeletion {
  public static final String JOB_TYPE = "DELETE_ACCOUNT";

  private final UserStore users;
  private final SessionStore sessions;
  private final DeletionCheckpointStore checkpoints;
  private final JobQueue jobs;
  private final PasswordEncoder passwords;
  private final Clock clock;

  public IdentityAccountDeletionService(
      UserStore users,
      SessionStore sessions,
      DeletionCheckpointStore checkpoints,
      JobQueue jobs,
      PasswordEncoder passwords,
      Clock clock) {
    this.users = users;
    this.sessions = sessions;
    this.checkpoints = checkpoints;
    this.jobs = jobs;
    this.passwords = passwords;
    this.clock = clock;
  }

  @Override
  @Transactional
  public UUID request(UUID userId, String currentPassword) {
    var user =
        users
            .findById(userId)
            .filter(value -> value.status() == UserStatus.ACTIVE)
            .orElseThrow(this::invalidCurrentPassword);
    if (!passwords.matches(currentPassword, user.passwordHash())) {
      throw invalidCurrentPassword();
    }

    Instant now = clock.instant();
    users.requestDeletion(userId, now);
    sessions.revokeAllForUser(userId, now);
    UUID jobId = jobs.enqueue(new EnqueueJob(userId, JOB_TYPE, userId, 1, "{}", now));
    checkpoints.create(userId, jobId, now);
    return jobId;
  }

  private ApiException invalidCurrentPassword() {
    return new ApiException(
        HttpStatus.UNAUTHORIZED, "INVALID_CURRENT_PASSWORD", "Current password is invalid");
  }
}
