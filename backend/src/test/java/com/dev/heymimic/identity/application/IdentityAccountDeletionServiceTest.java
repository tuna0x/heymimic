package com.dev.heymimic.identity.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.identity.application.port.DeletionCheckpointStore;
import com.dev.heymimic.identity.application.port.SessionStore;
import com.dev.heymimic.identity.application.port.UserRecord;
import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.domain.UserStatus;
import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class IdentityAccountDeletionServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000321");
  private static final UUID JOB_ID = UUID.fromString("00000000-0000-0000-0000-000000000654");
  private static final Instant NOW = Instant.parse("2026-09-07T12:00:00Z");
  private final UserStore users = mock(UserStore.class);
  private final SessionStore sessions = mock(SessionStore.class);
  private final DeletionCheckpointStore checkpoints = mock(DeletionCheckpointStore.class);
  private final JobQueue jobs = mock(JobQueue.class);
  private final PasswordEncoder passwords = mock(PasswordEncoder.class);
  private final IdentityAccountDeletionService service =
      new IdentityAccountDeletionService(
          users, sessions, checkpoints, jobs, passwords, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void marksAccountRevokesSessionsAndEnqueuesDeletionAtomically() {
    when(users.findById(USER_ID)).thenReturn(Optional.of(activeUser()));
    when(passwords.matches("current password", "password-hash")).thenReturn(true);
    when(jobs.enqueue(any(EnqueueJob.class))).thenReturn(JOB_ID);

    assertThat(service.request(USER_ID, "current password")).isEqualTo(JOB_ID);

    verify(users).requestDeletion(USER_ID, NOW);
    verify(sessions).revokeAllForUser(USER_ID, NOW);
    verify(checkpoints).create(USER_ID, JOB_ID, NOW);
  }

  @Test
  void wrongCurrentPasswordDoesNotStartDeletion() {
    when(users.findById(USER_ID)).thenReturn(Optional.of(activeUser()));
    when(passwords.matches("wrong password", "password-hash")).thenReturn(false);

    assertThatThrownBy(() -> service.request(USER_ID, "wrong password"))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("INVALID_CURRENT_PASSWORD"));
    verify(users, never()).requestDeletion(any(), any());
    verify(jobs, never()).enqueue(any());
  }

  private UserRecord activeUser() {
    return new UserRecord(
        USER_ID, "profile@example.com", "password-hash", UserStatus.ACTIVE, null, 1);
  }
}
