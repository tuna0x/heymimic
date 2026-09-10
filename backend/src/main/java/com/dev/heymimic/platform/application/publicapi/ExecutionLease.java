package com.dev.heymimic.platform.application.publicapi;

import java.util.Objects;
import java.util.UUID;

public record ExecutionLease(UUID jobId, String workerId, long generation) {
  public ExecutionLease {
    Objects.requireNonNull(jobId, "jobId is required");
    if (workerId == null || workerId.isBlank() || generation < 1)
      throw new IllegalArgumentException("A claimed execution lease is required");
  }
}
