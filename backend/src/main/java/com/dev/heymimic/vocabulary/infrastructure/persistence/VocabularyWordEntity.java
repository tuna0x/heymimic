package com.dev.heymimic.vocabulary.infrastructure.persistence;

import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vocabulary_words")
class VocabularyWordEntity {
  @Id private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "target_language", nullable = false, length = 16)
  private String targetLanguage;

  @Column(name = "normalized_word", nullable = false, length = 200)
  private String normalizedWord;

  @Column(name = "sense_key", nullable = false, length = 64)
  private String senseKey;

  @Column(nullable = false, length = 200)
  private String word;

  @Column(nullable = false, length = 1000)
  private String meaning;

  @Column(length = 200)
  private String pronunciation;

  @Column(name = "part_of_speech", length = 50)
  private String partOfSpeech;

  @Column(length = 2000)
  private String example;

  @Column(length = 2000)
  private String translation;

  @Column(name = "source_context", length = 4000)
  private String sourceContext;

  @Column(nullable = false)
  private int mastery;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private VocabularyStatus status;

  @Column(name = "interval_days", nullable = false)
  private int intervalDays;

  @Column(name = "next_review_at", nullable = false)
  private Instant nextReviewAt;

  @Column(name = "review_lock_session_id")
  private UUID reviewLockSessionId;

  @Version private long version;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected VocabularyWordEntity() {}

  UUID id() {
    return id;
  }

  UUID userId() {
    return userId;
  }

  String targetLanguage() {
    return targetLanguage;
  }

  String normalizedWord() {
    return normalizedWord;
  }

  String senseKey() {
    return senseKey;
  }

  String word() {
    return word;
  }

  String meaning() {
    return meaning;
  }

  String pronunciation() {
    return pronunciation;
  }

  String partOfSpeech() {
    return partOfSpeech;
  }

  String example() {
    return example;
  }

  String translation() {
    return translation;
  }

  String sourceContext() {
    return sourceContext;
  }

  int mastery() {
    return mastery;
  }

  VocabularyStatus status() {
    return status;
  }

  int intervalDays() {
    return intervalDays;
  }

  Instant nextReviewAt() {
    return nextReviewAt;
  }

  UUID reviewLockSessionId() {
    return reviewLockSessionId;
  }

  long version() {
    return version;
  }

  Instant createdAt() {
    return createdAt;
  }
}
