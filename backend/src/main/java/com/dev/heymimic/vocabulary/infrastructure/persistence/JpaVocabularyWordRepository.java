package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaVocabularyWordRepository extends JpaRepository<VocabularyWordEntity, UUID> {
  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query(
      """
      select word from VocabularyWordEntity word
      where word.userId = :userId and word.id in :ids
      order by word.id
      """)
  List<VocabularyWordEntity> lockOwnedByIds(
      @Param("userId") UUID userId, @Param("ids") List<UUID> ids);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query(
      """
      select word from VocabularyWordEntity word
      where word.userId = :userId and word.reviewLockSessionId is null
        and word.nextReviewAt <= :dueAt
      order by word.nextReviewAt, word.id
      """)
  List<VocabularyWordEntity> lockDue(
      @Param("userId") UUID userId,
      @Param("dueAt") Instant dueAt,
      org.springframework.data.domain.Pageable pageable);

  @Query(
      """
      select word from VocabularyWordEntity word
      where word.userId = :userId
        and (:status is null or word.status = :status)
        and (:dueBefore is null or word.nextReviewAt <= :dueBefore)
      """)
  Page<VocabularyWordEntity> findOwnedPage(
      @Param("userId") UUID userId,
      @Param("status") VocabularyStatus status,
      @Param("dueBefore") Instant dueBefore,
      Pageable pageable);

  Optional<VocabularyWordEntity> findByIdAndUserId(UUID id, UUID userId);

  List<VocabularyWordEntity> findByUserIdAndIdIn(UUID userId, List<UUID> ids);

  Optional<VocabularyWordEntity> findByUserIdAndTargetLanguageAndNormalizedWordAndSenseKey(
      UUID userId, String targetLanguage, String normalizedWord, String senseKey);

  boolean existsByUserIdAndTargetLanguageAndNormalizedWordAndSenseKeyAndIdNot(
      UUID userId, String targetLanguage, String normalizedWord, String senseKey, UUID excludedId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update VocabularyWordEntity word
      set word.meaning = coalesce(:meaning, word.meaning),
          word.example = coalesce(:example, word.example),
          word.sourceContext = coalesce(:sourceContext, word.sourceContext),
          word.senseKey = :senseKey,
          word.updatedAt = :now,
          word.version = word.version + 1
      where word.id = :id and word.userId = :userId
        and word.version = :expectedVersion and word.reviewLockSessionId is null
      """)
  int updateContent(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("meaning") String meaning,
      @Param("example") String example,
      @Param("sourceContext") String sourceContext,
      @Param("senseKey") String senseKey,
      @Param("expectedVersion") long expectedVersion,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update VocabularyWordEntity word set word.reviewLockSessionId = :sessionId
      where word.userId = :userId and word.id in :ids and word.reviewLockSessionId is null
      """)
  int assignReviewLock(
      @Param("userId") UUID userId,
      @Param("ids") List<UUID> ids,
      @Param("sessionId") UUID sessionId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update VocabularyWordEntity word
      set word.mastery = :mastery, word.status = :status,
          word.intervalDays = :intervalDays, word.nextReviewAt = :nextReviewAt,
          word.updatedAt = :now, word.version = word.version + 1
      where word.id = :id and word.userId = :userId
        and word.reviewLockSessionId = :sessionId and word.version = :expectedVersion
      """)
  int applyReviewState(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("sessionId") UUID sessionId,
      @Param("expectedVersion") long expectedVersion,
      @Param("mastery") int mastery,
      @Param("status") VocabularyStatus status,
      @Param("intervalDays") int intervalDays,
      @Param("nextReviewAt") Instant nextReviewAt,
      @Param("now") Instant now);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      "update VocabularyWordEntity word set word.reviewLockSessionId = null where word.userId = :userId")
  int clearReviewLocks(@Param("userId") UUID userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      """
      update VocabularyWordEntity word set word.reviewLockSessionId = null
      where word.userId = :userId and word.reviewLockSessionId = :sessionId
      """)
  int releaseReviewLocks(@Param("userId") UUID userId, @Param("sessionId") UUID sessionId);

  void deleteByUserId(UUID userId);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      value =
          """
          insert into vocabulary_words
            (id, user_id, target_language, normalized_word, sense_key, word, meaning,
             pronunciation, part_of_speech, example, translation, source_context,
             mastery, status, interval_days, next_review_at, version, created_at, updated_at)
          values
            (:id, :userId, :targetLanguage, :normalizedWord, :senseKey, :word, :meaning,
             :pronunciation, :partOfSpeech, :example, :translation, :sourceContext,
             0, 'NEW', 0, :now, 0, :now, :now)
          on conflict (user_id, target_language, normalized_word, sense_key) do nothing
          """,
      nativeQuery = true)
  int insertIfAbsent(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("targetLanguage") String targetLanguage,
      @Param("normalizedWord") String normalizedWord,
      @Param("senseKey") String senseKey,
      @Param("word") String word,
      @Param("meaning") String meaning,
      @Param("pronunciation") String pronunciation,
      @Param("partOfSpeech") String partOfSpeech,
      @Param("example") String example,
      @Param("translation") String translation,
      @Param("sourceContext") String sourceContext,
      @Param("now") Instant now);
}
