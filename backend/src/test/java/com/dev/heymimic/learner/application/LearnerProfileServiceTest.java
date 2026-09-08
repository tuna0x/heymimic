package com.dev.heymimic.learner.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.learner.application.port.LearnerProfileRecord;
import com.dev.heymimic.learner.application.port.LearnerProfileStore;
import com.dev.heymimic.learner.application.publicapi.CompleteOnboarding;
import com.dev.heymimic.learner.application.publicapi.UpdateLearnerProfile;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class LearnerProfileServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000123");
  private static final Instant NOW = Instant.parse("2026-09-07T12:00:00Z");
  private final LearnerProfileStore store = mock(LearnerProfileStore.class);
  private final LearnerProfileService service =
      new LearnerProfileService(store, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void identicalCompletedOnboardingIsIdempotent() {
    var command = new CompleteOnboarding("work", "beginner", 10, "en", "Asia/Bangkok");
    when(store.findByUserId(USER_ID)).thenReturn(Optional.of(completedProfile()));

    var result = service.completeOnboarding(USER_ID, command);

    assertThat(result.onboardingCompleted()).isTrue();
    assertThat(result.version()).isEqualTo(4);
    verify(store, never())
        .completeOnboarding(any(), any(), any(), anyInt(), any(), any(), anyLong(), any());
  }

  @Test
  void differentCompletedOnboardingIsRejected() {
    when(store.findByUserId(USER_ID)).thenReturn(Optional.of(completedProfile()));

    assertThatThrownBy(
            () ->
                service.completeOnboarding(
                    USER_ID,
                    new CompleteOnboarding("casual", "beginner", 10, "en", "Asia/Bangkok")))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("ONBOARDING_ALREADY_COMPLETED"));
  }

  @Test
  void staleProfileVersionIsRejected() {
    when(store.updateProfile(eq(USER_ID), eq("New name"), any(), any(), any(), eq(3L), eq(NOW)))
        .thenReturn(false);

    assertThatThrownBy(
            () ->
                service.update(
                    USER_ID, new UpdateLearnerProfile(" New name ", null, null, null, 3)))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("PROFILE_VERSION_CONFLICT"));
  }

  @Test
  void whitespaceOnlyNameIsRejectedBeforePersistence() {
    assertThatThrownBy(
            () -> service.update(USER_ID, new UpdateLearnerProfile("   ", null, null, null, 4)))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("INVALID_PROFILE_NAME"));
    verify(store, never()).updateProfile(any(), any(), any(), any(), any(), anyLong(), any());
  }

  private LearnerProfileRecord completedProfile() {
    return new LearnerProfileRecord(
        USER_ID, "Tuna", "en", "work", "beginner", 10, "Asia/Bangkok", NOW.minusSeconds(60), 4);
  }
}
