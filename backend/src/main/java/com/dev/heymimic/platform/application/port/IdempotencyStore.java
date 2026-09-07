package com.dev.heymimic.platform.application.port;

import java.time.Instant;
import java.util.UUID;

public interface IdempotencyStore {
  IdempotencyRecord begin(
      UUID recordId,
      UUID userId,
      String operation,
      UUID idempotencyKey,
      String requestHash,
      Instant now,
      Instant expiresAt);

  void complete(UUID recordId, int responseStatus, String responseBodyJson);
}
