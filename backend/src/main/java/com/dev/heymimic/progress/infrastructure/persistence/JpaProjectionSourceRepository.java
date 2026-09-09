package com.dev.heymimic.progress.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface JpaProjectionSourceRepository extends JpaRepository<ActivityLedgerEntity, UUID> {
  interface SourceStats {
    long getSourceRows();

    long getSourceSeconds();

    Instant getSourceWatermark();
  }

  @Query(
      value =
          """
          select count(*) as sourceRows,
                 coalesce(sum(duration_seconds), 0) as sourceSeconds,
                 max(occurred_at) as sourceWatermark
          from progress_activity_ledger
          """,
      nativeQuery = true)
  SourceStats sourceStats();
}
