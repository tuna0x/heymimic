package com.dev.heymimic.platform.application.publicapi;

import java.util.Objects;
import java.util.UUID;

public record ReserveQuota(UUID userId, UUID resourceId, String quotaKind, int amount) {
  public ReserveQuota {
    Objects.requireNonNull(userId, "userId is required");
    Objects.requireNonNull(resourceId, "resourceId is required");
    Objects.requireNonNull(quotaKind, "quotaKind is required");
    if (quotaKind.isBlank()) throw new IllegalArgumentException("quotaKind is required");
    if (quotaKind.length() > 100) throw new IllegalArgumentException("quotaKind is too long");
    if (amount < 1) throw new IllegalArgumentException("amount must be positive");
  }
}
