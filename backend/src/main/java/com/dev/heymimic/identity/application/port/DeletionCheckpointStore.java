package com.dev.heymimic.identity.application.port;

import java.time.Instant;
import java.util.UUID;

public interface DeletionCheckpointStore {
  void create(UUID userId, UUID jobId, Instant requestedAt);

  boolean isCompleted(UUID userId, String step);

  void completeStep(UUID userId, String step, Instant completedAt);

  void completeDeletion(UUID userId, Instant completedAt);
}
