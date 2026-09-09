package com.dev.heymimic.platform.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface DeliveryReplayStore {
  Optional<DeliveryReplayCandidate> lockDelivery(UUID deliveryId);

  boolean requeueFinalDelivery(UUID deliveryId, Instant now);

  void appendAudit(DeliveryReplayAudit audit);
}
