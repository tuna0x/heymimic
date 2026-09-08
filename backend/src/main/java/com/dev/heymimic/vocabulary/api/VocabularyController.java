package com.dev.heymimic.vocabulary.api;

import com.dev.heymimic.vocabulary.application.publicapi.UpdateVocabularyWord;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWords;
import jakarta.validation.Valid;
import java.time.Instant;
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
@RequestMapping("/api/v1/vocabulary")
public class VocabularyController {
  private final VocabularyWords words;

  public VocabularyController(VocabularyWords words) {
    this.words = words;
  }

  @GetMapping("/words")
  VocabularyWordPageResponse words(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          Instant dueBefore,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    var result = words.find(UUID.fromString(jwt.getSubject()), status, dueBefore, page, size);
    return new VocabularyWordPageResponse(
        result.items().stream().map(this::response).toList(),
        result.page(),
        result.size(),
        result.totalItems(),
        result.totalPages());
  }

  @PatchMapping("/words/{wordId}")
  VocabularyWordResponse update(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID wordId,
      @Valid @RequestBody UpdateVocabularyWordRequest request) {
    return response(
        words.update(
            UUID.fromString(jwt.getSubject()),
            wordId,
            new UpdateVocabularyWord(
                request.meaning(),
                request.example(),
                request.sourceContext(),
                request.expectedVersion())));
  }

  private VocabularyWordResponse response(VocabularyWordView word) {
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
