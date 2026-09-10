package com.dev.heymimic.platform.application.publicapi;

import java.util.Optional;
import java.util.UUID;

public interface UserContextRevisions {
  Optional<UserContextRevision> get(UUID userId, String contextKey);

  UserContextReadiness readiness(UUID userId, String contextKey, long revision);
}
