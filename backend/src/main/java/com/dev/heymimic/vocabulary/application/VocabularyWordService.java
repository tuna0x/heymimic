package com.dev.heymimic.vocabulary.application;

import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordRecord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import com.dev.heymimic.vocabulary.application.publicapi.UpdateVocabularyWord;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordPageView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWords;
import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VocabularyWordService implements VocabularyWords {
  private final VocabularyWordStore words;
  private final Clock clock;

  public VocabularyWordService(VocabularyWordStore words, Clock clock) {
    this.words = words;
    this.clock = clock;
  }

  @Override
  @Transactional(readOnly = true)
  public VocabularyWordPageView find(
      UUID userId, String status, Instant dueBefore, int page, int size) {
    if (page < 0 || size < 1 || size > 100) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_PAGE_REQUEST",
          "Page must be non-negative and size must be between 1 and 100");
    }
    VocabularyStatus parsedStatus = parseStatus(status);
    var result = words.findPage(userId, parsedStatus, dueBefore, page, size);
    return new VocabularyWordPageView(
        result.items().stream().map(this::view).toList(),
        result.page(),
        result.size(),
        result.totalItems(),
        result.totalPages());
  }

  @Override
  @Transactional
  public VocabularyWordView update(UUID userId, UUID wordId, UpdateVocabularyWord command) {
    validatePatch(command);
    VocabularyWordRecord current = loadOwned(wordId, userId);
    if (current.reviewLockSessionId() != null) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "VOCABULARY_WORD_LOCKED",
          "Vocabulary word is locked by an active review session");
    }

    String meaning = trim(command.meaning());
    String example = trim(command.example());
    String sourceContext = trim(command.sourceContext());
    String effectiveMeaning = meaning == null ? current.meaning() : meaning;
    String senseKey =
        VocabularyWordIdentity.senseKey(
            current.targetLanguage(), effectiveMeaning, current.partOfSpeech());
    if (words.semanticDuplicateExists(
        userId, current.targetLanguage(), current.normalizedWord(), senseKey, current.id())) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "VOCABULARY_WORD_DUPLICATE",
          "A vocabulary word with the same meaning already exists");
    }

    boolean updated =
        words.updateContent(
            wordId,
            userId,
            meaning,
            example,
            sourceContext,
            senseKey,
            command.expectedVersion(),
            clock.instant());
    if (!updated) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "VOCABULARY_VERSION_CONFLICT",
          "Vocabulary word was updated by another request");
    }
    return view(loadOwned(wordId, userId));
  }

  private VocabularyWordRecord loadOwned(UUID wordId, UUID userId) {
    return words
        .findOwned(wordId, userId)
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND,
                    "VOCABULARY_WORD_NOT_FOUND",
                    "Vocabulary word not found"));
  }

  private VocabularyStatus parseStatus(String value) {
    if (value == null || value.isBlank()) return null;
    try {
      return VocabularyStatus.valueOf(value.toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException exception) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_VOCABULARY_STATUS",
          "Status must be new, reviewing or mastered");
    }
  }

  private void validatePatch(UpdateVocabularyWord command) {
    if (command.meaning() == null && command.example() == null && command.sourceContext() == null) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "EMPTY_VOCABULARY_PATCH", "At least one field must be provided");
    }
    if (isBlank(command.meaning())
        || isBlank(command.example())
        || isBlank(command.sourceContext())) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_VOCABULARY_CONTENT",
          "Provided vocabulary content must not be blank");
    }
  }

  private boolean isBlank(String value) {
    return value != null && value.isBlank();
  }

  private String trim(String value) {
    return value == null ? null : value.trim();
  }

  private VocabularyWordView view(VocabularyWordRecord word) {
    return new VocabularyWordView(
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
        word.status().apiValue(),
        word.intervalDays(),
        word.nextReviewAt(),
        word.version(),
        word.createdAt());
  }
}
