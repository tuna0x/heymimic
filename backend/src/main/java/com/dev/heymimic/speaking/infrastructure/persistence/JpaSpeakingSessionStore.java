package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.port.SpeakingSessionPage;
import com.dev.heymimic.speaking.application.port.SpeakingSessionRecord;
import com.dev.heymimic.speaking.application.port.SpeakingSessionStore;
import com.dev.heymimic.speaking.application.port.SpeakingTopicRecord;
import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;

@Repository
public class JpaSpeakingSessionStore implements SpeakingSessionStore {
  private final JpaSpeakingSessionRepository repository;

  public JpaSpeakingSessionStore(JpaSpeakingSessionRepository repository) {
    this.repository = repository;
  }

  @Override
  public void create(
      UUID id,
      UUID userId,
      SpeakingTopicRecord topic,
      String promptSnapshotJson,
      String timezoneSnapshot,
      Instant now) {
    try {
      repository.saveAndFlush(
          new SpeakingSessionEntity(
              id, userId, topic.id(), topic.revision(), promptSnapshotJson, timezoneSnapshot, now));
    } catch (DataIntegrityViolationException exception) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "ACTIVE_SPEAKING_SESSION_EXISTS",
          "An active speaking session already exists");
    }
  }

  @Override
  public Optional<SpeakingSessionRecord> findOwned(UUID id, UUID userId) {
    return repository.findByIdAndUserId(id, userId).map(this::record);
  }

  @Override
  public Optional<SpeakingSessionRecord> findActive(UUID userId) {
    return repository
        .findByUserIdAndStatus(userId, SpeakingSessionStatus.IN_PROGRESS)
        .map(this::record);
  }

  @Override
  public Optional<SpeakingSessionRecord> lockOwned(UUID id, UUID userId) {
    return repository.lockOwned(id, userId).map(this::record);
  }

  @Override
  public SpeakingSessionPage findHistory(UUID userId, int page, int size) {
    var result =
        repository.findByUserIdOrderByStartedAtDescIdDesc(userId, PageRequest.of(page, size));
    return new SpeakingSessionPage(
        result.getContent().stream().map(this::record).toList(),
        page,
        size,
        result.getTotalElements(),
        result.getTotalPages());
  }

  @Override
  public boolean complete(
      SpeakingSessionRecord session, UUID selectedAttemptId, Instant completedAt) {
    return repository.complete(
            session.id(), session.userId(), selectedAttemptId, session.version(), completedAt)
        == 1;
  }

  @Override
  public boolean abandon(SpeakingSessionRecord session, Instant now) {
    return repository.abandon(session.id(), session.userId(), session.version(), now) == 1;
  }

  @Override
  public void deleteByUserId(UUID userId) {
    repository.deleteByUserId(userId);
    repository.flush();
  }

  private SpeakingSessionRecord record(SpeakingSessionEntity session) {
    return new SpeakingSessionRecord(
        session.id(),
        session.userId(),
        session.topicId(),
        session.topicRevision(),
        session.promptSnapshot(),
        session.timezoneSnapshot(),
        session.status(),
        session.selectedAttemptId(),
        session.version(),
        session.startedAt(),
        session.completedAt());
  }
}
