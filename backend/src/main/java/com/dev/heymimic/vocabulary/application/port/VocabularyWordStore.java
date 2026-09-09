package com.dev.heymimic.vocabulary.application.port;

import com.dev.heymimic.vocabulary.domain.ReviewWordState;
import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VocabularyWordStore {
  VocabularyWordPage findPage(
      UUID userId, VocabularyStatus status, Instant dueBefore, int page, int size);

  Optional<VocabularyWordRecord> findOwned(UUID id, UUID userId);

  List<VocabularyWordRecord> findOwnedByIds(UUID userId, List<UUID> wordIds);

  Optional<VocabularyWordRecord> findSemantic(
      UUID userId, String targetLanguage, String normalizedWord, String senseKey);

  VocabularyWordRecord createOrFind(NewVocabularyWord word);

  boolean semanticDuplicateExists(
      UUID userId, String targetLanguage, String normalizedWord, String senseKey, UUID excludedId);

  boolean updateContent(
      UUID id,
      UUID userId,
      String meaning,
      String example,
      String sourceContext,
      String senseKey,
      long expectedVersion,
      Instant now);

  List<VocabularyWordRecord> lockOwnedForReview(UUID userId, List<UUID> wordIds);

  List<VocabularyWordRecord> lockDueForReview(UUID userId, Instant dueAt, int limit);

  boolean assignReviewLock(UUID userId, List<UUID> wordIds, UUID sessionId);

  boolean applyReviewState(
      UUID id,
      UUID userId,
      UUID sessionId,
      long expectedVersion,
      ReviewWordState state,
      Instant now);

  int releaseReviewLocks(UUID userId, UUID sessionId);
}
