package com.dev.heymimic.learner.application.port;

import java.time.Instant;
import java.util.UUID;

public interface LearnerProfileStore {
  void create(UUID userId, String name, String timezone, Instant now);
}
