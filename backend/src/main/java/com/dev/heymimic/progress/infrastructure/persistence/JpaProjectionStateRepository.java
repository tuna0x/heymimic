package com.dev.heymimic.progress.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaProjectionStateRepository extends JpaRepository<ProjectionStateEntity, Short> {
  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_READ)
  @Query("select state from ProjectionStateEntity state where state.id = 1")
  ProjectionStateEntity lockShared();

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query("select state from ProjectionStateEntity state where state.id = 1")
  ProjectionStateEntity lockExclusive();

  @Query("select state.activeGenerationId from ProjectionStateEntity state where state.id = 1")
  UUID activeGenerationId();

  @Modifying
  @Query(
      """
      update ProjectionStateEntity state
      set state.activeGenerationId = :generationId,
          state.version = state.version + 1,
          state.updatedAt = :updatedAt
      where state.id = 1
      """)
  void activate(@Param("generationId") UUID generationId, @Param("updatedAt") Instant updatedAt);
}
