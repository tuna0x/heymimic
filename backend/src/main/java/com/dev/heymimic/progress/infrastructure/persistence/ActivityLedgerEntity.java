package com.dev.heymimic.progress.infrastructure.persistence;

import com.dev.heymimic.progress.domain.ProgressSourceType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "progress_activity_ledger")
class ActivityLedgerEntity {
  @Id private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "event_id", nullable = false, unique = true)
  private UUID eventId;

  @Enumerated(EnumType.STRING)
  @Column(name = "source_type", nullable = false, length = 32)
  private ProgressSourceType sourceType;

  @Column(name = "source_id", nullable = false)
  private UUID sourceId;

  @Column(name = "activity_date", nullable = false)
  private LocalDate activityDate;

  @Column(name = "timezone_snapshot", nullable = false, length = 64)
  private String timezoneSnapshot;

  @Column(name = "duration_seconds", nullable = false)
  private int durationSeconds;

  @Column(name = "rule_version", nullable = false, length = 32)
  private String ruleVersion;

  @Column(name = "occurred_at", nullable = false)
  private Instant occurredAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected ActivityLedgerEntity() {}
}
