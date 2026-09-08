package com.dev.heymimic.study.api;

import com.dev.heymimic.study.application.publicapi.PlannedStudyStep;
import com.dev.heymimic.study.application.publicapi.StudySessionView;
import com.dev.heymimic.study.application.publicapi.StudySessions;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/study-sessions")
public class StudySessionController {
  private final StudySessions sessions;

  public StudySessionController(StudySessions sessions) {
    this.sessions = sessions;
  }

  @PostMapping
  ResponseEntity<StudySessionView> start(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @Valid @RequestBody CreateStudySessionRequest request) {
    var plan =
        request.plannedSteps().stream()
            .map(step -> new PlannedStudyStep(step.kind(), step.wordIds(), step.topicId()))
            .toList();
    var started = sessions.start(UUID.fromString(jwt.getSubject()), idempotencyKey, plan);
    return ResponseEntity.created(URI.create("/api/v1/study-sessions/" + started.session().id()))
        .header("Idempotency-Replayed", Boolean.toString(started.replayed()))
        .body(started.session());
  }

  @GetMapping("/active")
  ResponseEntity<StudySessionView> active(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(sessions.active(UUID.fromString(jwt.getSubject())).orElse(null));
  }

  @GetMapping("/{sessionId}")
  StudySessionView get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sessionId) {
    return sessions.get(UUID.fromString(jwt.getSubject()), sessionId);
  }

  @PatchMapping("/{sessionId}/step")
  StudySessionView advance(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID sessionId,
      @Valid @RequestBody AdvanceStudyStepRequest request) {
    return sessions.advance(
        UUID.fromString(jwt.getSubject()),
        sessionId,
        request.targetStep(),
        request.expectedVersion());
  }

  @PostMapping("/{sessionId}/complete")
  ResponseEntity<StudySessionView> complete(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody FinishStudySessionRequest request) {
    var completed =
        sessions.complete(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            sessionId,
            request.expectedVersion());
    return ResponseEntity.ok()
        .header("Idempotency-Replayed", Boolean.toString(completed.replayed()))
        .body(completed.session());
  }

  @PostMapping("/{sessionId}/abandon")
  ResponseEntity<Void> abandon(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody FinishStudySessionRequest request) {
    var abandoned =
        sessions.abandon(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            sessionId,
            request.expectedVersion());
    return ResponseEntity.noContent()
        .header("Idempotency-Replayed", Boolean.toString(abandoned.replayed()))
        .build();
  }
}
