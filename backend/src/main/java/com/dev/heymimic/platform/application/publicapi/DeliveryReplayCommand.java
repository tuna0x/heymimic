package com.dev.heymimic.platform.application.publicapi;

import java.util.Objects;
import java.util.UUID;

public record DeliveryReplayCommand(
    UUID deliveryId, String operatorIdentity, String reason, boolean dryRun) {
  public DeliveryReplayCommand {
    Objects.requireNonNull(deliveryId, "deliveryId is required");
    operatorIdentity = normalize(operatorIdentity, "operatorIdentity", 3, 200);
    reason = normalize(reason, "reason", 10, 1_000);
  }

  private static String normalize(String value, String field, int minimum, int maximum) {
    if (value == null) {
      throw new IllegalArgumentException(field + " is required");
    }
    String normalized = value.trim();
    if (normalized.length() < minimum || normalized.length() > maximum) {
      throw new IllegalArgumentException(
          field + " length must be between " + minimum + " and " + maximum);
    }
    return normalized;
  }
}
