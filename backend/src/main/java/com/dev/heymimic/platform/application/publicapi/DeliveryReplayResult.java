package com.dev.heymimic.platform.application.publicapi;

import java.util.UUID;

public record DeliveryReplayResult(
    UUID auditId,
    UUID deliveryId,
    DeliveryReplayOutcome outcome,
    String previousStatus,
    boolean eligible,
    boolean requeued) {}
