package com.dev.heymimic.platform.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record UserContextRevision(
    UUID userId,
    String contextKey,
    long revision,
    long readyCheckpointRevision,
    Instant updatedAt) {
  public boolean readyThrough(long requestedRevision) {
    return requestedRevision >= 0 && requestedRevision <= readyCheckpointRevision;
  }
}
