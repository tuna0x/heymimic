package com.dev.heymimic.learner.api;

import com.dev.heymimic.identity.application.publicapi.IdentityAccountReader;
import com.dev.heymimic.learner.application.publicapi.CompleteOnboarding;
import com.dev.heymimic.learner.application.publicapi.LearnerProfileView;
import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.learner.application.publicapi.UpdateLearnerProfile;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {
  private final LearnerProfiles profiles;
  private final IdentityAccountReader accounts;

  public MeController(LearnerProfiles profiles, IdentityAccountReader accounts) {
    this.profiles = profiles;
    this.accounts = accounts;
  }

  @GetMapping
  LearnerProfileResponse get(@AuthenticationPrincipal Jwt jwt) {
    UUID userId = UUID.fromString(jwt.getSubject());
    return response(profiles.get(userId));
  }

  @PatchMapping("/profile")
  LearnerProfileResponse update(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateProfileRequest request) {
    return response(
        profiles.update(
            UUID.fromString(jwt.getSubject()),
            new UpdateLearnerProfile(
                request.name(),
                request.goal(),
                request.dailyMinutesGoal(),
                request.timezone(),
                request.expectedVersion())));
  }

  @PutMapping("/onboarding")
  ResponseEntity<LearnerProfileResponse> onboard(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody OnboardingRequest request) {
    var profile =
        profiles.completeOnboarding(
            UUID.fromString(jwt.getSubject()),
            new CompleteOnboarding(
                request.goal(),
                request.selfAssessedLevel(),
                request.dailyMinutesGoal(),
                request.targetLanguage(),
                request.timezone()));
    return ResponseEntity.ok(response(profile));
  }

  private LearnerProfileResponse response(LearnerProfileView profile) {
    var account = accounts.get(profile.id());
    return new LearnerProfileResponse(
        profile.id(),
        profile.name(),
        account.email(),
        account.emailVerified(),
        profile.targetLanguage(),
        profile.goal(),
        profile.selfAssessedLevel(),
        profile.dailyMinutesGoal(),
        profile.timezone(),
        profile.onboardingCompleted(),
        profile.version());
  }
}
