package com.dev.heymimic.progress.infrastructure.persistence;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaActivityLedgerRepository extends JpaRepository<ActivityLedgerEntity, UUID> {
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(
      value =
          """
          insert into progress_activity_ledger
            (id, user_id, event_id, source_type, source_id, activity_date,
             timezone_snapshot, duration_seconds, rule_version, occurred_at, created_at)
          values
            (:id, :userId, :eventId, :sourceType, :sourceId, :activityDate,
             :timezone, :durationSeconds, :ruleVersion, :occurredAt, :createdAt)
          on conflict do nothing
          """,
      nativeQuery = true)
  int insertIfAbsent(
      @Param("id") UUID id,
      @Param("userId") UUID userId,
      @Param("eventId") UUID eventId,
      @Param("sourceType") String sourceType,
      @Param("sourceId") UUID sourceId,
      @Param("activityDate") LocalDate activityDate,
      @Param("timezone") String timezone,
      @Param("durationSeconds") int durationSeconds,
      @Param("ruleVersion") String ruleVersion,
      @Param("occurredAt") Instant occurredAt,
      @Param("createdAt") Instant createdAt);

  void deleteByUserId(UUID userId);
}
