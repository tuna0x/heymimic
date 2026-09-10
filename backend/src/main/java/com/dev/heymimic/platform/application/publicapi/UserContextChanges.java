package com.dev.heymimic.platform.application.publicapi;

import java.util.List;
import java.util.UUID;

/** Records a source mutation that invalidates a user's derived learning context. */
public interface UserContextChanges {
  String LEARNING_CONTEXT = "learning";

  long record(UUID userId, String contextKey, UUID causeEventId, List<String> requiredConsumers);
}
