package com.dev.heymimic.platform.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public record PublishedEvent(
    UUID deliveryId,
    String consumerName,
    UUID eventId,
    UUID ownerUserId,
    String eventType,
    int schemaVersion,
    UUID aggregateId,
    Instant occurredAt,
    String payloadJson,
    int attempts,
    long leaseGeneration,
    Instant leaseUntil) {}
