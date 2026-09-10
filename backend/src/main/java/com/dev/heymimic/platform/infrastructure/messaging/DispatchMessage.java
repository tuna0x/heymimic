package com.dev.heymimic.platform.infrastructure.messaging;

import java.util.UUID;

public record DispatchMessage(int schemaVersion, UUID dispatchId, long generation) {
  public DispatchMessage {
    if (schemaVersion != 1 || dispatchId == null || generation < 1)
      throw new IllegalArgumentException("Invalid dispatch envelope");
  }
}
