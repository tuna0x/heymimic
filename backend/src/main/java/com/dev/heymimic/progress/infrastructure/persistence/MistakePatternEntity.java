package com.dev.heymimic.progress.infrastructure.persistence;

import com.dev.heymimic.progress.domain.MistakeStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "progress_mistake_patterns")
class MistakePatternEntity {
  @Id private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(nullable = false, length = 32)
  private String category;

  @Column(name = "pattern_key", nullable = false, length = 160)
  private String patternKey;

  @Column(name = "taxonomy_version", nullable = false, length = 32)
  private String taxonomyVersion;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(nullable = false, length = 2000)
  private String explanation;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private MistakeStatus status;

  @Column(nullable = false)
  private long version;

  @Column(name = "first_seen_at", nullable = false)
  private Instant firstSeenAt;

  @Column(name = "last_seen_at", nullable = false)
  private Instant lastSeenAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected MistakePatternEntity() {}

  UUID id() {
    return id;
  }

  UUID userId() {
    return userId;
  }

  String category() {
    return category;
  }

  String patternKey() {
    return patternKey;
  }

  String taxonomyVersion() {
    return taxonomyVersion;
  }

  String title() {
    return title;
  }

  String explanation() {
    return explanation;
  }

  MistakeStatus status() {
    return status;
  }

  long version() {
    return version;
  }

  Instant firstSeenAt() {
    return firstSeenAt;
  }

  Instant lastSeenAt() {
    return lastSeenAt;
  }
}
