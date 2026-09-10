package com.dev.heymimic.study.api;

import com.dev.heymimic.study.application.publicapi.DailyPlanEnvelope;
import com.dev.heymimic.study.application.publicapi.DailyPlanRequests;
import com.dev.heymimic.study.application.publicapi.DailyPlanView;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/study/daily-plans")
public class DailyPlanController {
  private final DailyPlanRequests plans;

  public DailyPlanController(DailyPlanRequests plans) {
    this.plans = plans;
  }

  @PostMapping
  ResponseEntity<DailyPlanView> compose(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @Valid @RequestBody ComposeDailyPlanRequest request) {
    var created =
        plans.compose(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            request == null ? null : request.goalMinutes(),
            request == null ? null : request.sourceBriefId());
    return ResponseEntity.created(URI.create("/api/v1/study/daily-plans/" + created.plan().id()))
        .header("Idempotency-Replayed", Boolean.toString(created.replayed()))
        .body(created.plan());
  }

  @GetMapping("/today")
  DailyPlanEnvelope today(@AuthenticationPrincipal Jwt jwt) {
    return plans.today(UUID.fromString(jwt.getSubject()));
  }
}
