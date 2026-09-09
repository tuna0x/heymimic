package com.dev.heymimic.progress.infrastructure.persistence;

import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaProjectionGenerationRepository
    extends JpaRepository<ProjectionGenerationEntity, UUID> {
  @Modifying
  @Query(
      """
      update ProjectionGenerationEntity generation
      set generation.status = 'RETIRED'
      where generation.status = 'ACTIVE'
      """)
  void retireActive();

  @Modifying
  @Query(
      """
      update ProjectionGenerationEntity generation
      set generation.status = 'ACTIVE',
          generation.sourceWatermark = :watermark,
          generation.sourceRows = :sourceRows,
          generation.sourceSeconds = :sourceSeconds,
          generation.activatedAt = :activatedAt
      where generation.id = :id and generation.status = 'BUILDING'
      """)
  int activate(
      @Param("id") UUID id,
      @Param("watermark") Instant watermark,
      @Param("sourceRows") long sourceRows,
      @Param("sourceSeconds") long sourceSeconds,
      @Param("activatedAt") Instant activatedAt);

  @Modifying
  @Query(
      """
      update ProjectionGenerationEntity generation
      set generation.status = 'FAILED'
      where generation.id = :id and generation.status = 'BUILDING'
      """)
  void fail(@Param("id") UUID id);
}
