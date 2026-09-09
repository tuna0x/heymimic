package com.dev.heymimic.platform.application.publicapi;

import java.util.Objects;
import java.util.UUID;

public record ProviderBudgetReservationCommand(
    UUID operationId,
    UUID resourceId,
    UUID userId,
    String operation,
    String stage,
    int executionAttempt) {

  public ProviderBudgetReservationCommand {
    Objects.requireNonNull(operationId, "operationId is required");
    Objects.requireNonNull(resourceId, "resourceId is required");
    Objects.requireNonNull(userId, "userId is required");
    if (operation == null || operation.isBlank()) {
      throw new IllegalArgumentException("operation is required");
    }
    if (stage == null || stage.isBlank()) {
      throw new IllegalArgumentException("stage is required");
    }
    if (executionAttempt < 1) {
      throw new IllegalArgumentException("executionAttempt must be positive");
    }
  }
}
