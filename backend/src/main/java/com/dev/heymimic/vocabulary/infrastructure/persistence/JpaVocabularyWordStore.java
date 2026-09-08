package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.NewVocabularyWord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordPage;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordRecord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import com.dev.heymimic.vocabulary.domain.ReviewWordState;
import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;

@Repository
public class JpaVocabularyWordStore implements VocabularyWordStore {
  private final JpaVocabularyWordRepository repository;

  public JpaVocabularyWordStore(JpaVocabularyWordRepository repository) {
    this.repository = repository;
  }

  @Override
  public VocabularyWordPage findPage(
      UUID userId, VocabularyStatus status, Instant dueBefore, int page, int size) {
    var pageable =
        PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
    var result = repository.findOwnedPage(userId, status, dueBefore, pageable);
    return new VocabularyWordPage(
        result.getContent().stream().map(this::record).toList(),
        result.getNumber(),
        result.getSize(),
        result.getTotalElements(),
        result.getTotalPages());
  }

  @Override
  public Optional<VocabularyWordRecord> findOwned(UUID id, UUID userId) {
    return repository.findByIdAndUserId(id, userId).map(this::record);
  }

  @Override
  public List<VocabularyWordRecord> findOwnedByIds(UUID userId, List<UUID> wordIds) {
    return repository.findByUserIdAndIdIn(userId, wordIds).stream().map(this::record).toList();
  }

  @Override
  public Optional<VocabularyWordRecord> findSemantic(
      UUID userId, String targetLanguage, String normalizedWord, String senseKey) {
    return repository
        .findByUserIdAndTargetLanguageAndNormalizedWordAndSenseKey(
            userId, targetLanguage, normalizedWord, senseKey)
        .map(this::record);
  }

  @Override
  public VocabularyWordRecord createOrFind(NewVocabularyWord word) {
    repository.insertIfAbsent(
        word.id(),
        word.userId(),
        word.targetLanguage(),
        word.normalizedWord(),
        word.senseKey(),
        word.word(),
        word.meaning(),
        word.pronunciation(),
        word.partOfSpeech(),
        word.example(),
        word.translation(),
        word.sourceContext(),
        word.now());
    return findSemantic(
            word.userId(), word.targetLanguage(), word.normalizedWord(), word.senseKey())
        .orElseThrow(() -> new IllegalStateException("Vocabulary insert did not return a word"));
  }

  @Override
  public boolean semanticDuplicateExists(
      UUID userId, String targetLanguage, String normalizedWord, String senseKey, UUID excludedId) {
    return repository.existsByUserIdAndTargetLanguageAndNormalizedWordAndSenseKeyAndIdNot(
        userId, targetLanguage, normalizedWord, senseKey, excludedId);
  }

  @Override
  public boolean updateContent(
      UUID id,
      UUID userId,
      String meaning,
      String example,
      String sourceContext,
      String senseKey,
      long expectedVersion,
      Instant now) {
    try {
      return repository.updateContent(
              id, userId, meaning, example, sourceContext, senseKey, expectedVersion, now)
          == 1;
    } catch (DataIntegrityViolationException exception) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "VOCABULARY_WORD_DUPLICATE",
          "A vocabulary word with the same meaning already exists");
    }
  }

  @Override
  public List<VocabularyWordRecord> lockOwnedForReview(UUID userId, List<UUID> wordIds) {
    return repository.lockOwnedByIds(userId, wordIds).stream().map(this::record).toList();
  }

  @Override
  public List<VocabularyWordRecord> lockDueForReview(UUID userId, Instant dueAt, int limit) {
    return repository.lockDue(userId, dueAt, PageRequest.of(0, limit)).stream()
        .map(this::record)
        .toList();
  }

  @Override
  public boolean assignReviewLock(UUID userId, List<UUID> wordIds, UUID sessionId) {
    return repository.assignReviewLock(userId, wordIds, sessionId) == wordIds.size();
  }

  @Override
  public boolean applyReviewState(
      UUID id,
      UUID userId,
      UUID sessionId,
      long expectedVersion,
      ReviewWordState state,
      Instant now) {
    return repository.applyReviewState(
            id,
            userId,
            sessionId,
            expectedVersion,
            state.mastery(),
            state.status(),
            state.intervalDays(),
            state.nextReviewAt(),
            now)
        == 1;
  }

  @Override
  public int releaseReviewLocks(UUID userId, UUID sessionId) {
    return repository.releaseReviewLocks(userId, sessionId);
  }

  private VocabularyWordRecord record(VocabularyWordEntity word) {
    return new VocabularyWordRecord(
        word.id(),
        word.userId(),
        word.targetLanguage(),
        word.normalizedWord(),
        word.senseKey(),
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
        word.reviewLockSessionId(),
        word.version(),
        word.createdAt());
  }
}
