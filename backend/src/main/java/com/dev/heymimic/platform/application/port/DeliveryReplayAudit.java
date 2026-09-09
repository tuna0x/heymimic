package com.dev.heymimic.platform.application.port;

import com.dev.heymimic.platform.application.publicapi.DeliveryReplayOutcome;
import java.time.Instant;
import java.util.UUID;

public record DeliveryReplayAudit(
    UUID id,
    UUID deliveryId,
    UUID eventId,
    String consumerName,
    String previousStatus,
    Integer previousAttempts,
    String previousErrorCode,
    String operatorIdentity,
    String reason,
    boolean dryRun,
    DeliveryReplayOutcome outcome,
    Instant requestedAt) {}
