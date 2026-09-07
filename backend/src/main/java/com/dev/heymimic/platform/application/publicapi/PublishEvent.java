package com.dev.heymimic.platform.application.publicapi;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record PublishEvent(
    UUID ownerUserId,
    String eventType,
    int schemaVersion,
    UUID aggregateId,
    Instant occurredAt,
    String payloadJson) {
  public PublishEvent {
    Objects.requireNonNull(eventType, "eventType is required");
    Objects.requireNonNull(aggregateId, "aggregateId is required");
    Objects.requireNonNull(occurredAt, "occurredAt is required");
    Objects.requireNonNull(payloadJson, "payloadJson is required");
    if (eventType.isBlank()) throw new IllegalArgumentException("eventType is required");
    if (schemaVersion < 1) throw new IllegalArgumentException("schemaVersion must be positive");
  }
}
