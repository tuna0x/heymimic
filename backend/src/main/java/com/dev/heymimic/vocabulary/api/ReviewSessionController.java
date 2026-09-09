package com.dev.heymimic.vocabulary.api;

import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessionView;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessions;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vocabulary/review-sessions")
public class ReviewSessionController {
  private final ReviewSessions sessions;

  public ReviewSessionController(ReviewSessions sessions) {
    this.sessions = sessions;
  }

  @PostMapping
  ResponseEntity<ReviewSessionResponse> start(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @Valid @RequestBody StartReviewSessionRequest request) {
    var started =
        sessions.start(UUID.fromString(jwt.getSubject()), idempotencyKey, request.wordIds());
    return ResponseEntity.created(
            URI.create("/api/v1/vocabulary/review-sessions/" + started.session().id()))
        .header("Idempotency-Replayed", Boolean.toString(started.replayed()))
        .body(response(started.session()));
  }

  @GetMapping("/{sessionId}")
  ReviewSessionResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sessionId) {
    return response(sessions.get(UUID.fromString(jwt.getSubject()), sessionId));
  }

  @PostMapping("/{sessionId}/ratings")
  ResponseEntity<RateReviewWordResponse> rate(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody RateReviewWordRequest request) {
    var rated =
        sessions.rate(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            sessionId,
            request.wordId(),
            request.rating(),
            request.expectedVersion());
    return ResponseEntity.ok()
        .header("Idempotency-Replayed", Boolean.toString(rated.replayed()))
        .body(new RateReviewWordResponse(rated.eventId(), response(rated.session())));
  }

  @DeleteMapping("/{sessionId}/ratings/{eventId}")
  ResponseEntity<Void> undo(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @PathVariable UUID eventId,
      @org.springframework.web.bind.annotation.RequestParam long expectedVersion) {
    var undone =
        sessions.undo(
            UUID.fromString(jwt.getSubject()), idempotencyKey, sessionId, eventId, expectedVersion);
    return ResponseEntity.noContent()
        .header("Idempotency-Replayed", Boolean.toString(undone.replayed()))
        .build();
  }

  @PostMapping("/{sessionId}/complete")
  ResponseEntity<ReviewCompletionResponse> complete(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody FinishReviewSessionRequest request) {
    var completed =
        sessions.complete(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            sessionId,
            request.expectedVersion());
    return ResponseEntity.ok()
        .header("Idempotency-Replayed", Boolean.toString(completed.replayed()))
        .body(
            new ReviewCompletionResponse(
                completed.sessionId(),
                completed.totalWords(),
                completed.rememberedWords(),
                completed.needsReviewWords(),
                completed.acceptedDurationSeconds(),
                completed.completedAt()));
  }

  @PostMapping("/{sessionId}/abandon")
  ResponseEntity<Void> abandon(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody FinishReviewSessionRequest request) {
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

  @GetMapping("/active")
  ResponseEntity<ReviewSessionResponse> active(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(
        sessions.active(UUID.fromString(jwt.getSubject())).map(this::response).orElse(null));
  }

  private ReviewSessionResponse response(ReviewSessionView session) {
    return new ReviewSessionResponse(
        session.id(),
        session.status(),
        session.timezone(),
        session.schedulerVersion(),
        session.currentIndex(),
        session.version(),
        session.startedAt(),
        session.completedAt(),
        session.items());
  }
}
