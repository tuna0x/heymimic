package com.dev.heymimic.platform.application.publicapi;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface UserContextChangeStore extends UserContextRevisions {
  long record(
      UUID userId,
      String contextKey,
      UUID causeEventId,
      List<String> requiredConsumers,
      Instant now);
}
