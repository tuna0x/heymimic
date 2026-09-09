package com.dev.heymimic.progress.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "progress_projection_generations")
class ProjectionGenerationEntity {
  @Id private UUID id;

  @Column(nullable = false, length = 24)
  private String status;

  @Column(name = "rule_version", nullable = false, length = 32)
  private String ruleVersion;

  @Column(name = "source_watermark")
  private Instant sourceWatermark;

  @Column(name = "source_rows", nullable = false)
  private long sourceRows;

  @Column(name = "source_seconds", nullable = false)
  private long sourceSeconds;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "activated_at")
  private Instant activatedAt;

  protected ProjectionGenerationEntity() {}

  ProjectionGenerationEntity(UUID id, String ruleVersion, Instant createdAt) {
    this.id = id;
    this.status = "BUILDING";
    this.ruleVersion = ruleVersion;
    this.createdAt = createdAt;
  }
}
