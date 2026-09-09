package com.dev.heymimic.platform.application.port;

import com.dev.heymimic.platform.domain.DeliveryStatus;
import java.util.UUID;

public record DeliveryReplayCandidate(
    UUID deliveryId,
    UUID eventId,
    String consumerName,
    DeliveryStatus status,
    int attempts,
    String lastErrorCode) {}
