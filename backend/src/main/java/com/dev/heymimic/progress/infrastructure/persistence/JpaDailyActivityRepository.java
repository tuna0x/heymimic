package com.dev.heymimic.progress.infrastructure.persistence;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaDailyActivityRepository
    extends JpaRepository<DailyActivityEntity, DailyActivityEntity.Key> {
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      value =
          """
          insert into progress_daily_activities
            (generation_id, user_id, activity_date, vocab_seconds, speaking_seconds,
             qualifies_for_streak, timezone_snapshot, projected_through, updated_at)
          values
            (:generationId, :userId, :activityDate, :vocabularySeconds, :speakingSeconds,
             (:vocabularySeconds + :speakingSeconds) >= 60,
             :timezoneSnapshot, :projectedThrough, :updatedAt)
          on conflict (generation_id, user_id, activity_date) do update set
            vocab_seconds =
              progress_daily_activities.vocab_seconds + excluded.vocab_seconds,
            speaking_seconds =
              progress_daily_activities.speaking_seconds + excluded.speaking_seconds,
            qualifies_for_streak =
              progress_daily_activities.vocab_seconds + excluded.vocab_seconds
              + progress_daily_activities.speaking_seconds + excluded.speaking_seconds >= 60,
            timezone_snapshot = excluded.timezone_snapshot,
            projected_through =
              greatest(progress_daily_activities.projected_through, excluded.projected_through),
            updated_at = excluded.updated_at
          """,
      nativeQuery = true)
  void add(
      @Param("generationId") UUID generationId,
      @Param("userId") UUID userId,
      @Param("activityDate") LocalDate activityDate,
      @Param("vocabularySeconds") int vocabularySeconds,
      @Param("speakingSeconds") int speakingSeconds,
      @Param("timezoneSnapshot") String timezoneSnapshot,
      @Param("projectedThrough") Instant projectedThrough,
      @Param("updatedAt") Instant updatedAt);

  List<DailyActivityEntity> findByGenerationIdAndUserIdAndActivityDateBetweenOrderByActivityDate(
      UUID generationId, UUID userId, LocalDate from, LocalDate to);

  List<DailyActivityEntity> findByGenerationIdAndUserIdOrderByActivityDate(
      UUID generationId, UUID userId);

  @Query(
      "select max(activity.projectedThrough) from DailyActivityEntity activity"
          + " where activity.generationId = :generationId and activity.userId = :userId")
  Instant projectedThrough(@Param("generationId") UUID generationId, @Param("userId") UUID userId);

  @Modifying
  @Query("delete from DailyActivityEntity activity where activity.generationId = :generationId")
  void deleteGeneration(@Param("generationId") UUID generationId);

  @Modifying
  @Query(
      value =
          """
          insert into progress_daily_activities
            (generation_id, user_id, activity_date, vocab_seconds, speaking_seconds,
             qualifies_for_streak, timezone_snapshot, projected_through, updated_at)
          select
            :generationId,
            ledger.user_id,
            ledger.activity_date,
            sum(case when ledger.source_type = 'VOCABULARY_REVIEW'
                     then ledger.duration_seconds else 0 end)::integer,
            sum(case when ledger.source_type = 'SPEAKING_SESSION'
                     then ledger.duration_seconds else 0 end)::integer,
            sum(ledger.duration_seconds) >= 60,
            (array_agg(ledger.timezone_snapshot order by ledger.occurred_at desc))[1],
            max(ledger.occurred_at),
            :updatedAt
          from progress_activity_ledger ledger
          group by ledger.user_id, ledger.activity_date
          """,
      nativeQuery = true)
  void populateFromLedger(
      @Param("generationId") UUID generationId, @Param("updatedAt") Instant updatedAt);

  @Query(
      value = "select count(*) from progress_daily_activities where generation_id = :generationId",
      nativeQuery = true)
  long countDays(@Param("generationId") UUID generationId);

  @Query(
      value =
          """
          select coalesce(sum(vocab_seconds + speaking_seconds), 0)
          from progress_daily_activities where generation_id = :generationId
          """,
      nativeQuery = true)
  long sumSeconds(@Param("generationId") UUID generationId);

  void deleteByUserId(UUID userId);
}
