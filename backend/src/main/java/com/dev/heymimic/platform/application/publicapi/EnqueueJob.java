package com.dev.heymimic.platform.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record EnqueueJob(
    UUID ownerUserId,
    String type,
    UUID resourceId,
    int payloadVersion,
    String payloadJson,
    Instant runAt) {
  public EnqueueJob {
    if (type == null || type.isBlank()) throw new IllegalArgumentException("type is required");
    if (resourceId == null) throw new IllegalArgumentException("resourceId is required");
    if (payloadVersion < 1) throw new IllegalArgumentException("payloadVersion must be positive");
    if (payloadJson == null || payloadJson.isBlank())
      throw new IllegalArgumentException("payload is required");
    if (runAt == null) throw new IllegalArgumentException("runAt is required");
  }
}
