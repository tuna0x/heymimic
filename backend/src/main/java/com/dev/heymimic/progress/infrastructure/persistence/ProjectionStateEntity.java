package com.dev.heymimic.progress.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "progress_projection_state")
class ProjectionStateEntity {
  @Id private short id;

  @Column(name = "active_generation_id", nullable = false)
  private UUID activeGenerationId;

  @Column(nullable = false)
  private long version;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected ProjectionStateEntity() {}

  UUID activeGenerationId() {
    return activeGenerationId;
  }
}
