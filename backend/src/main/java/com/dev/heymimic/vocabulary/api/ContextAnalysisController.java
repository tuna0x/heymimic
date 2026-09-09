package com.dev.heymimic.vocabulary.api;

import com.dev.heymimic.vocabulary.application.publicapi.ContextAnalyses;
import com.dev.heymimic.vocabulary.application.publicapi.ContextAnalysisView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordView;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vocabulary")
public class ContextAnalysisController {
  private final ContextAnalyses analyses;

  public ContextAnalysisController(ContextAnalyses analyses) {
    this.analyses = analyses;
  }

  @PostMapping("/context-analysis")
  ResponseEntity<StartedContextAnalysisResponse> start(
      @AuthenticationPrincipal Jwt jwt,
      @RequestHeader("Idempotency-Key") UUID idempotencyKey,
      @Valid @RequestBody AnalyzeContextRequest request) {
    var result =
        analyses.start(
            UUID.fromString(jwt.getSubject()),
            idempotencyKey,
            request.text(),
            request.targetLanguage());
    return ResponseEntity.status(202)
        .location(URI.create(result.pollUrl()))
        .header("Idempotency-Replayed", Boolean.toString(result.replayed()))
        .body(
            new StartedContextAnalysisResponse(
                result.analysisId(), result.status(), result.pollUrl()));
  }

  @GetMapping("/context-analyses/{analysisId}")
  ContextAnalysisResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID analysisId) {
    return response(analyses.get(UUID.fromString(jwt.getSubject()), analysisId));
  }

  @PostMapping("/words")
  ResponseEntity<SavedVocabularyWordsResponse> save(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SaveVocabularyWordsRequest request) {
    var saved =
        analyses.save(
            UUID.fromString(jwt.getSubject()), request.analysisId(), request.suggestionIds());
    return ResponseEntity.created(URI.create("/api/v1/vocabulary/words"))
        .body(new SavedVocabularyWordsResponse(saved.stream().map(this::wordResponse).toList()));
  }

  private ContextAnalysisResponse response(ContextAnalysisView analysis) {
    return new ContextAnalysisResponse(
        analysis.id(),
        analysis.status(),
        analysis.suggestions().stream()
            .map(
                suggestion ->
                    new VocabularySuggestionResponse(
                        suggestion.id(),
                        suggestion.word(),
                        suggestion.meaning(),
                        suggestion.pronunciation(),
                        suggestion.partOfSpeech(),
                        suggestion.example(),
                        suggestion.translation(),
                        suggestion.sourceSentence(),
                        suggestion.existingWordId()))
            .toList(),
        analysis.source(),
        analysis.expiresAt(),
        analysis.errorCode());
  }

  private VocabularyWordResponse wordResponse(VocabularyWordView word) {
    return new VocabularyWordResponse(
        word.id(),
        word.targetLanguage(),
        word.word(),
        word.meaning(),
        word.pronunciation(),
        word.partOfSpeech(),
        word.example(),
        word.translation(),
        word.sourceContext(),
        word.mastery(),
        word.status(),
        word.intervalDays(),
        word.nextReviewAt(),
        word.version(),
        word.createdAt());
  }
}
