package com.dev.heymimic.study.infrastructure.persistence;

import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.study.application.port.NewStudyStep;
import com.dev.heymimic.study.application.port.StudySessionRecord;
import com.dev.heymimic.study.application.port.StudySessionStore;
import com.dev.heymimic.study.application.port.StudyStepRecord;
import com.dev.heymimic.study.domain.StudySessionStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;

@Repository
public class JpaStudySessionStore implements StudySessionStore {
  private final JpaStudySessionRepository sessions;
  private final JpaStudyStepRepository steps;

  public JpaStudySessionStore(JpaStudySessionRepository sessions, JpaStudyStepRepository steps) {
    this.sessions = sessions;
    this.steps = steps;
  }

  @Override
  public void create(UUID id, UUID userId, String timezoneSnapshot, Instant now) {
    try {
      sessions.saveAndFlush(new StudySessionEntity(id, userId, timezoneSnapshot, now));
    } catch (DataIntegrityViolationException exception) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "ACTIVE_STUDY_SESSION_EXISTS",
          "An active study session already exists");
    }
  }

  @Override
  public void addSteps(UUID studySessionId, List<NewStudyStep> newSteps, Instant now) {
    steps.saveAllAndFlush(
        newSteps.stream().map(step -> new StudyStepEntity(studySessionId, step, now)).toList());
  }

  @Override
  public Optional<StudySessionRecord> findOwned(UUID id, UUID userId) {
    return sessions.findByIdAndUserId(id, userId).map(this::record);
  }

  @Override
  public Optional<StudySessionRecord> findActive(UUID userId) {
    return sessions.findByUserIdAndStatus(userId, StudySessionStatus.IN_PROGRESS).map(this::record);
  }

  @Override
  public Optional<StudySessionRecord> lockOwned(UUID id, UUID userId) {
    return sessions.lockOwned(id, userId).map(this::record);
  }

  @Override
  public List<StudyStepRecord> findSteps(UUID studySessionId) {
    return steps.findByStudySessionIdOrderByPosition(studySessionId).stream()
        .map(this::record)
        .toList();
  }

  @Override
  public boolean advance(StudySessionRecord session, int targetStep, Instant now) {
    return sessions.advance(session.id(), session.userId(), session.version(), targetStep, now)
        == 1;
  }

  @Override
  public boolean complete(StudySessionRecord session, Instant completedAt) {
    return sessions.complete(session.id(), session.userId(), session.version(), completedAt) == 1;
  }

  @Override
  public boolean abandon(StudySessionRecord session, Instant now) {
    return sessions.abandon(session.id(), session.userId(), session.version(), now) == 1;
  }

  @Override
  public void deleteByUserId(UUID userId) {
    sessions.deleteByUserId(userId);
    sessions.flush();
  }

  private StudySessionRecord record(StudySessionEntity session) {
    return new StudySessionRecord(
        session.id(),
        session.userId(),
        session.status(),
        session.timezoneSnapshot(),
        session.currentStep(),
        session.version(),
        session.startedAt(),
        session.completedAt());
  }

  private StudyStepRecord record(StudyStepEntity step) {
    return new StudyStepRecord(
        step.id(),
        step.studySessionId(),
        step.position(),
        step.kind(),
        step.reviewSessionId(),
        step.speakingSessionId());
  }
}
