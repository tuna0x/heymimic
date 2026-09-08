package com.dev.heymimic.study.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudySessionStore {
  void create(UUID id, UUID userId, String timezoneSnapshot, Instant now);

  void addSteps(UUID studySessionId, List<NewStudyStep> steps, Instant now);

  Optional<StudySessionRecord> findOwned(UUID id, UUID userId);

  Optional<StudySessionRecord> findActive(UUID userId);

  Optional<StudySessionRecord> lockOwned(UUID id, UUID userId);

  List<StudyStepRecord> findSteps(UUID studySessionId);

  boolean advance(StudySessionRecord session, int targetStep, Instant now);

  boolean complete(StudySessionRecord session, Instant completedAt);

  boolean abandon(StudySessionRecord session, Instant now);

  void deleteByUserId(UUID userId);
}
