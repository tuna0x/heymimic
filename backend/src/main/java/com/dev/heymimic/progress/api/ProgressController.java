package com.dev.heymimic.progress.api;

import com.dev.heymimic.progress.application.publicapi.DailyProgressView;
import com.dev.heymimic.progress.application.publicapi.MistakeDetailView;
import com.dev.heymimic.progress.application.publicapi.MistakePatternPageView;
import com.dev.heymimic.progress.application.publicapi.MistakePatternView;
import com.dev.heymimic.progress.application.publicapi.MistakeQueries;
import com.dev.heymimic.progress.application.publicapi.ProgressOverviewView;
import com.dev.heymimic.progress.application.publicapi.ProgressQueries;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {
  private final ProgressQueries progress;
  private final MistakeQueries mistakes;

  public ProgressController(ProgressQueries progress, MistakeQueries mistakes) {
    this.progress = progress;
    this.mistakes = mistakes;
  }

  @GetMapping("/daily")
  DailyProgressView daily(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    return progress.daily(UUID.fromString(jwt.getSubject()), from, to);
  }

  @GetMapping("/overview")
  ProgressOverviewView overview(@AuthenticationPrincipal Jwt jwt) {
    return progress.overview(UUID.fromString(jwt.getSubject()));
  }

  @GetMapping("/mistakes")
  MistakePatternPageView mistakes(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String category,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return mistakes.find(UUID.fromString(jwt.getSubject()), status, category, page, size);
  }

  @GetMapping("/mistakes/{patternId}")
  MistakeDetailView mistake(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID patternId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return mistakes.get(UUID.fromString(jwt.getSubject()), patternId, page, size);
  }

  @PatchMapping("/mistakes/{patternId}")
  MistakePatternView updateMistake(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID patternId,
      @Valid @RequestBody UpdateMistakeStatusRequest request) {
    return mistakes.updateStatus(
        UUID.fromString(jwt.getSubject()), patternId, request.status(), request.expectedVersion());
  }
}
