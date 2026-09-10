package com.dev.heymimic.peer.api;

import com.dev.heymimic.peer.application.PeerPractice;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/peer")
public class PeerSessionController {
  private final PeerPractice peer;

  public PeerSessionController(PeerPractice peer) {
    this.peer = peer;
  }

  @GetMapping("/scenarios")
  List<PeerScenarioView> scenarios(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String level) {
    return peer.scenarios(category, level);
  }

  @PostMapping("/sessions")
  ResponseEntity<PeerSessionView> start(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @Valid @RequestBody StartPeerSessionRequest request) {
    UUID userId = userId(jwt);
    PeerSessionView session = peer.start(userId, idempotencyKey, request.scenarioVersionId());
    return ResponseEntity.created(URI.create("/api/v1/peer/sessions/" + session.id()))
        .body(session);
  }

  @GetMapping("/sessions/active")
  ResponseEntity<PeerSessionView> active(@AuthenticationPrincipal Jwt jwt) {
    return ResponseEntity.ok(peer.active(userId(jwt)).orElse(null));
  }

  @GetMapping("/sessions/{sessionId}")
  PeerSessionView get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID sessionId) {
    return peer.get(userId(jwt), sessionId);
  }

  @PostMapping("/sessions/{sessionId}/invites")
  ResponseEntity<PeerInviteView> createInvite(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId) {
    PeerInviteView invite = peer.createInvite(userId(jwt), idempotencyKey, sessionId);
    return ResponseEntity.created(URI.create("/api/v1/peer/sessions/" + sessionId + "/invites"))
        .body(invite);
  }

  @PostMapping("/invites/accept")
  PeerSessionView acceptInvite(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @Valid @RequestBody AcceptPeerInviteRequest request) {
    return peer.acceptInvite(userId(jwt), idempotencyKey, request.token());
  }

  @PatchMapping("/sessions/{sessionId}/ready")
  PeerSessionView ready(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody SetPeerReadyRequest request) {
    return peer.setReady(
        userId(jwt), idempotencyKey, sessionId, request.ready(), request.expectedVersion());
  }

  @PostMapping("/sessions/{sessionId}/start")
  PeerSessionView startRoom(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody StartPeerRoomRequest request) {
    return peer.startRoom(userId(jwt), idempotencyKey, sessionId, request.expectedVersion());
  }

  @PostMapping("/sessions/{sessionId}/end")
  PeerSessionView end(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @PathVariable UUID sessionId,
      @Valid @RequestBody EndPeerSessionRequest request) {
    return peer.end(
        userId(jwt), idempotencyKey, sessionId, request.expectedVersion(), request.endReason());
  }

  private UUID userId(Jwt jwt) {
    return UUID.fromString(jwt.getSubject());
  }
}
