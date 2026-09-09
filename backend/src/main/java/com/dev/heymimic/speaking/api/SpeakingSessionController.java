package com.dev.heymimic.speaking.api;

import com.dev.heymimic.speaking.application.publicapi.AttemptPlaybackView;
import com.dev.heymimic.speaking.application.publicapi.AttemptUploadView;
import com.dev.heymimic.speaking.application.publicapi.CompletedSpeakingSession;
import com.dev.heymimic.speaking.application.publicapi.SpeakingAttemptView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingAttempts;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluationView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluations;
import com.dev.heymimic.speaking.application.publicapi.SpeakingPractice;
import com.dev.heymimic.speaking.application.publicapi.SpeakingSessionHistoryPage;
import com.dev.heymimic.speaking.application.publicapi.SpeakingSessionView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingTopicView;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/speaking")
public class SpeakingSessionController {
  private final SpeakingPractice speaking;
  private final SpeakingAttempts attempts;
  private final SpeakingEvaluations evaluations;

  public SpeakingSessionController(
      SpeakingPractice speaking, SpeakingAttempts attempts, SpeakingEvaluations evaluations) {
    this.speaking = speaking;
    this.attempts = attempts;
    this.evaluations = evaluations;
  }

  @GetMapping("/topics")
  List<SpeakingTopicView> topics(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String level) {
    return speaking.topics(category, level);
  }

  @PostMapping("/sessions")
  ResponseEntity<SpeakingSessionView> start(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @Valid @RequestBody StartSpeakingSessionRequest request) {
    var started =
        speaking.start(UUID.fromString(jwt.getSubject()), idempotencyKey, request.topicId());
    return ResponseEntity.created(URI.create("/api/v1/speaking/sessions/" + started.session().id()))
        .header("Idempotency-Replayed", Boolean.toString(started.replayed()))
        .body(started.session());
  }

  @GetMapping("/sessions/active")
  ResponseEntity<SpeakingSessionView> active(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(speaking.active(UUID.fromString(jwt.getSubject())).orElse(null));
  }

  @GetMapping("/sessions/{sessionId}")
  SpeakingSessionView get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sessionId) {
    return speaking.get(UUID.fromString(jwt.getSubject()), sessionId);
  }

  @GetMapping("/sessions")
  SpeakingSessionHistoryPage history(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return speaking.history(UUID.fromString(jwt.getSubject()), page, size);
  }

  @PostMapping("/sessions/{sessionId}/abandon")
  ResponseEntity<Void> abandon(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody FinishSpeakingSessionRequest request) {
    var abandoned =
        speaking.abandon(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            sessionId,
            request.expectedVersion());
    return ResponseEntity.noContent()
        .header("Idempotency-Replayed", Boolean.toString(abandoned.replayed()))
        .build();
  }

  @PostMapping("/sessions/{sessionId}/complete")
  ResponseEntity<CompletedSpeakingSession> complete(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody CompleteSpeakingSessionRequest request) {
    var completed =
        speaking.complete(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            sessionId,
            request.selectedAttemptId(),
            request.expectedVersion());
    return ResponseEntity.ok()
        .header("Idempotency-Replayed", Boolean.toString(completed.replayed()))
        .body(completed);
  }

  @PostMapping("/sessions/{sessionId}/attempts")
  ResponseEntity<AttemptUploadView> createAttempt(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody CreateSpeakingAttemptRequest request) {
    var created =
        attempts.create(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            sessionId,
            request.mimeType(),
            request.sizeBytes());
    return ResponseEntity.created(URI.create("/api/v1/speaking/attempts/" + created.attempt().id()))
        .header("Idempotency-Replayed", Boolean.toString(created.replayed()))
        .body(created);
  }

  @PostMapping("/attempts/{attemptId}/upload-url")
  AttemptUploadView renewUpload(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID attemptId,
      @Valid @RequestBody RenewAttemptUploadRequest request) {
    return attempts.renewUpload(
        UUID.fromString(jwt.getSubject()), attemptId, request.expectedVersion());
  }

  @PostMapping("/attempts/{attemptId}/upload-complete")
  SpeakingAttemptView completeUpload(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID attemptId,
      @Valid @RequestBody CompleteAttemptUploadRequest request) {
    return attempts.completeUpload(
        UUID.fromString(jwt.getSubject()), attemptId, request.checksumSha256());
  }

  @GetMapping("/attempts/{attemptId}/audio")
  ResponseEntity<AttemptPlaybackView> playback(
      @AuthenticationPrincipal Jwt jwt, @PathVariable UUID attemptId) {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .body(attempts.playback(UUID.fromString(jwt.getSubject()), attemptId));
  }

  @PostMapping("/attempts/{attemptId}/evaluate")
  ResponseEntity<SpeakingEvaluationView> evaluate(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID attemptId) {
    var started = evaluations.start(UUID.fromString(jwt.getSubject()), idempotencyKey, attemptId);
    return ResponseEntity.accepted()
        .header("Location", "/api/v1/speaking/attempts/" + attemptId + "/evaluation")
        .header("Retry-After", "2")
        .header("Idempotency-Replayed", Boolean.toString(started.replayed()))
        .body(started.evaluation());
  }

  @GetMapping("/attempts/{attemptId}/evaluation")
  SpeakingEvaluationView evaluation(
      @AuthenticationPrincipal Jwt jwt, @PathVariable UUID attemptId) {
    return evaluations.getByAttempt(UUID.fromString(jwt.getSubject()), attemptId);
  }
}
