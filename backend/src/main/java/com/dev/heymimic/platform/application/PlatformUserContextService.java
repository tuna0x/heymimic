package com.dev.heymimic.platform.application;

import com.dev.heymimic.platform.application.publicapi.UserContextChangeStore;
import com.dev.heymimic.platform.application.publicapi.UserContextChanges;
import com.dev.heymimic.platform.application.publicapi.UserContextReadiness;
import com.dev.heymimic.platform.application.publicapi.UserContextRevision;
import com.dev.heymimic.platform.application.publicapi.UserContextRevisions;
import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformUserContextService implements UserContextChanges, UserContextRevisions {
  private final UserContextChangeStore store;
  private final Clock clock;

  public PlatformUserContextService(UserContextChangeStore store, Clock clock) {
    this.store = store;
    this.clock = clock;
  }

  @Override
  @Transactional
  public long record(
      UUID userId, String contextKey, UUID causeEventId, List<String> requiredConsumers) {
    if (userId == null || contextKey == null || contextKey.isBlank() || causeEventId == null) {
      throw new IllegalArgumentException("A user context change requires an owner, key and event");
    }
    return store.record(
        userId,
        contextKey,
        causeEventId,
        requiredConsumers == null ? List.of() : requiredConsumers,
        clock.instant());
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<UserContextRevision> get(UUID userId, String contextKey) {
    return store.get(userId, contextKey);
  }

  @Override
  @Transactional(readOnly = true)
  public UserContextReadiness readiness(UUID userId, String contextKey, long revision) {
    return store.readiness(userId, contextKey, revision);
  }
}
