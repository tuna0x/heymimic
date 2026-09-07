package com.dev.heymimic.platform.application.publicapi;

import java.util.UUID;

public interface QuotaManager {
  UUID reserve(ReserveQuota command);

  void consume(UUID reservationId, UUID userId);

  void release(UUID reservationId, UUID userId);
}
