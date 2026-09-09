package com.dev.heymimic.progress.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "progress_daily_activities")
@IdClass(DailyActivityEntity.Key.class)
class DailyActivityEntity {
  @Id
  @Column(name = "generation_id")
  private UUID generationId;

  @Id
  @Column(name = "user_id")
  private UUID userId;

  @Id
  @Column(name = "activity_date")
  private LocalDate activityDate;

  @Column(name = "vocab_seconds", nullable = false)
  private int vocabularySeconds;

  @Column(name = "speaking_seconds", nullable = false)
  private int speakingSeconds;

  @Column(name = "qualifies_for_streak", nullable = false)
  private boolean qualifiesForStreak;

  @Column(name = "timezone_snapshot", nullable = false, length = 64)
  private String timezoneSnapshot;

  @Column(name = "projected_through", nullable = false)
  private Instant projectedThrough;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected DailyActivityEntity() {}

  UUID userId() {
    return userId;
  }

  LocalDate activityDate() {
    return activityDate;
  }

  int vocabularySeconds() {
    return vocabularySeconds;
  }

  int speakingSeconds() {
    return speakingSeconds;
  }

  boolean qualifiesForStreak() {
    return qualifiesForStreak;
  }

  String timezoneSnapshot() {
    return timezoneSnapshot;
  }

  Instant projectedThrough() {
    return projectedThrough;
  }

  public static class Key implements Serializable {
    private UUID generationId;
    private UUID userId;
    private LocalDate activityDate;

    public Key() {}

    @Override
    public boolean equals(Object other) {
      if (this == other) return true;
      if (!(other instanceof Key key)) return false;
      return java.util.Objects.equals(generationId, key.generationId)
          && java.util.Objects.equals(userId, key.userId)
          && java.util.Objects.equals(activityDate, key.activityDate);
    }

    @Override
    public int hashCode() {
      return java.util.Objects.hash(generationId, userId, activityDate);
    }
  }
}
