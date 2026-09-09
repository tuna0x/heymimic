package com.dev.heymimic.speaking.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SpeakingSessionStore {
  void create(
      UUID id,
      UUID userId,
      SpeakingTopicRecord topic,
      String promptSnapshotJson,
      String timezoneSnapshot,
      Instant now);

  Optional<SpeakingSessionRecord> findOwned(UUID id, UUID userId);

  Optional<SpeakingSessionRecord> findActive(UUID userId);

  Optional<SpeakingSessionRecord> lockOwned(UUID id, UUID userId);

  SpeakingSessionPage findHistory(UUID userId, int page, int size);

  boolean complete(SpeakingSessionRecord session, UUID selectedAttemptId, Instant completedAt);

  boolean abandon(SpeakingSessionRecord session, Instant now);

  void deleteByUserId(UUID userId);
}
