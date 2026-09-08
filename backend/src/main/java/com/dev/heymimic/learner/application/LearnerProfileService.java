package com.dev.heymimic.learner.application;

import com.dev.heymimic.learner.application.port.LearnerProfileStore;
import com.dev.heymimic.learner.application.publicapi.CompleteOnboarding;
import com.dev.heymimic.learner.application.publicapi.CreateLearnerProfile;
import com.dev.heymimic.learner.application.publicapi.LearnerProfileCreator;
import com.dev.heymimic.learner.application.publicapi.LearnerProfileView;
import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.learner.application.publicapi.UpdateLearnerProfile;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LearnerProfileService implements LearnerProfileCreator, LearnerProfiles {
  private static final Set<Integer> DAILY_GOALS = Set.of(5, 10, 15);
  private final LearnerProfileStore store;
  private final Clock clock;

  public LearnerProfileService(LearnerProfileStore store, Clock clock) {
    this.store = store;
    this.clock = clock;
  }

  @Override
  public void create(CreateLearnerProfile command) {
    store.create(command.userId(), command.name(), command.timezone(), clock.instant());
  }

  @Override
  @Transactional(readOnly = true)
  public LearnerProfileView get(UUID userId) {
    return view(load(userId));
  }

  @Override
  @Transactional
  public LearnerProfileView update(UUID userId, UpdateLearnerProfile command) {
    validateName(command.name());
    validateDailyGoal(command.dailyMinutesGoal());
    validateTimezone(command.timezone());
    boolean updated =
        store.updateProfile(
            userId,
            trim(command.name()),
            command.goal(),
            command.dailyMinutesGoal(),
            command.timezone(),
            command.expectedVersion(),
            clock.instant());
    if (!updated) throw versionConflict();
    return view(load(userId));
  }

  @Override
  @Transactional
  public LearnerProfileView completeOnboarding(UUID userId, CompleteOnboarding command) {
    validateDailyGoal(command.dailyMinutesGoal());
    validateTimezone(command.timezone());
    var current = load(userId);
    if (current.onboardingCompletedAt() != null) {
      if (sameOnboarding(current, command)) return view(current);
      throw new ApiException(
          HttpStatus.CONFLICT, "ONBOARDING_ALREADY_COMPLETED", "Onboarding is already completed");
    }
    if (!store.completeOnboarding(
        userId,
        command.goal(),
        command.selfAssessedLevel(),
        command.dailyMinutesGoal(),
        command.targetLanguage(),
        command.timezone(),
        current.version(),
        clock.instant())) {
      throw versionConflict();
    }
    return view(load(userId));
  }

  private com.dev.heymimic.learner.application.port.LearnerProfileRecord load(UUID userId) {
    return store
        .findByUserId(userId)
        .orElseThrow(
            () -> new ApiException(HttpStatus.NOT_FOUND, "PROFILE_NOT_FOUND", "Profile not found"));
  }

  private LearnerProfileView view(
      com.dev.heymimic.learner.application.port.LearnerProfileRecord profile) {
    return new LearnerProfileView(
        profile.userId(),
        profile.name(),
        profile.targetLanguage(),
        profile.goal(),
        profile.selfAssessedLevel(),
        profile.dailyMinutesGoal(),
        profile.timezone(),
        profile.onboardingCompletedAt() != null,
        profile.version());
  }

  private boolean sameOnboarding(
      com.dev.heymimic.learner.application.port.LearnerProfileRecord current,
      CompleteOnboarding command) {
    return java.util.Objects.equals(current.goal(), command.goal())
        && java.util.Objects.equals(current.selfAssessedLevel(), command.selfAssessedLevel())
        && java.util.Objects.equals(current.dailyMinutesGoal(), command.dailyMinutesGoal())
        && java.util.Objects.equals(current.targetLanguage(), command.targetLanguage())
        && java.util.Objects.equals(current.timezone(), command.timezone());
  }

  private void validateDailyGoal(Integer value) {
    if (value != null && !DAILY_GOALS.contains(value)) {
      throw new ApiException(
          HttpStatus.UNPROCESSABLE_CONTENT,
          "INVALID_DAILY_MINUTES_GOAL",
          "Daily minutes goal must be 5, 10 or 15");
    }
  }

  private void validateName(String value) {
    if (value != null && value.isBlank()) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "INVALID_PROFILE_NAME", "Profile name must not be blank");
    }
  }

  private void validateTimezone(String value) {
    if (value == null) return;
    try {
      ZoneId.of(value);
    } catch (DateTimeException exception) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TIMEZONE", "Timezone is invalid");
    }
  }

  private String trim(String value) {
    return value == null ? null : value.trim();
  }

  private ApiException versionConflict() {
    return new ApiException(
        HttpStatus.CONFLICT, "PROFILE_VERSION_CONFLICT", "Profile was updated by another request");
  }
}
