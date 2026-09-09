package com.dev.heymimic.platform.application.publicapi;

import java.util.UUID;

public record ProviderUsageReceipt(
    UUID operationId,
    UUID resourceId,
    UUID userId,
    String operation,
    String stage,
    int executionAttempt,
    String provider,
    String model,
    ProviderCallStatus status,
    ProviderUsage usage,
    String errorCode) {

  public ProviderUsageReceipt {
    if (operationId == null) throw new IllegalArgumentException("operationId is required");
    if (resourceId == null) throw new IllegalArgumentException("resourceId is required");
    if (userId == null) throw new IllegalArgumentException("userId is required");
    if (operation == null || operation.isBlank()) {
      throw new IllegalArgumentException("operation is required");
    }
    if (stage == null || stage.isBlank()) throw new IllegalArgumentException("stage is required");
    if (executionAttempt < 1)
      throw new IllegalArgumentException("executionAttempt must be positive");
    if (status == null) throw new IllegalArgumentException("status is required");
    if (usage == null) usage = ProviderUsage.unknown();
  }

  public static ProviderUsageReceipt succeeded(
      UUID operationId,
      UUID resourceId,
      UUID userId,
      String operation,
      String stage,
      int executionAttempt,
      String provider,
      String model,
      ProviderUsage usage) {
    return new ProviderUsageReceipt(
        operationId,
        resourceId,
        userId,
        operation,
        stage,
        executionAttempt,
        provider,
        model,
        ProviderCallStatus.SUCCEEDED,
        usage,
        null);
  }

  public static ProviderUsageReceipt unknownFailure(
      UUID operationId,
      UUID resourceId,
      UUID userId,
      String operation,
      String stage,
      int executionAttempt,
      String errorCode) {
    return new ProviderUsageReceipt(
        operationId,
        resourceId,
        userId,
        operation,
        stage,
        executionAttempt,
        null,
        null,
        ProviderCallStatus.UNKNOWN,
        ProviderUsage.unknown(),
        errorCode);
  }
}
