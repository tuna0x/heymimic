package com.dev.heymimic.platform.application.publicapi;

import java.time.Duration;
import java.util.Objects;
import java.util.UUID;

public record IdempotencyCommand(
    UUID userId, String operation, UUID idempotencyKey, String canonicalRequest, Duration ttl) {
  public IdempotencyCommand {
    Objects.requireNonNull(userId, "userId is required");
    Objects.requireNonNull(operation, "operation is required");
    Objects.requireNonNull(idempotencyKey, "idempotencyKey is required");
    Objects.requireNonNull(canonicalRequest, "canonicalRequest is required");
    Objects.requireNonNull(ttl, "ttl is required");
    if (operation.isBlank()) throw new IllegalArgumentException("operation is required");
    if (ttl.isZero() || ttl.isNegative())
      throw new IllegalArgumentException("ttl must be positive");
  }
}
