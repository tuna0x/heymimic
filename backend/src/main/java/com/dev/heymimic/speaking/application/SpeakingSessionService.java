package com.dev.heymimic.speaking.application;

import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.OutboxPublisher;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.application.port.SpeakingEvaluationRecord;
import com.dev.heymimic.speaking.application.port.SpeakingEvaluationStore;
import com.dev.heymimic.speaking.application.port.SpeakingSessionRecord;
import com.dev.heymimic.speaking.application.port.SpeakingSessionStore;
import com.dev.heymimic.speaking.application.port.SpeakingTopicRecord;
import com.dev.heymimic.speaking.application.port.SpeakingTopicStore;
import com.dev.heymimic.speaking.application.publicapi.AbandonedSpeakingSession;
import com.dev.heymimic.speaking.application.publicapi.CompletedSpeakingSession;
import com.dev.heymimic.speaking.application.publicapi.SpeakingAttemptDetailView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingAttemptView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluationView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingPractice;
import com.dev.heymimic.speaking.application.publicapi.SpeakingSessionHistoryPage;
import com.dev.heymimic.speaking.application.publicapi.SpeakingSessionView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingTopicContentView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingTopicView;
import com.dev.heymimic.speaking.application.publicapi.StartedSpeakingSession;
import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus;
import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class SpeakingSessionService implements SpeakingPractice {
  private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(1);
  private static final Set<String> CATEGORIES = Set.of("work", "interview", "casual", "opinion");
  private static final Set<String> LEVELS = Set.of("A2-B1", "B1-B2", "B2+");
  private final SpeakingTopicStore topics;
  private final SpeakingSessionStore sessions;
  private final SpeakingAttemptStore attempts;
  private final SpeakingEvaluationStore evaluations;
  private final LearnerProfiles profiles;
  private final IdempotencyExecutor idempotency;
  private final OutboxPublisher outbox;
  private final ObjectMapper objectMapper;
  private final Clock clock;

  public SpeakingSessionService(
      SpeakingTopicStore topics,
      SpeakingSessionStore sessions,
      SpeakingAttemptStore attempts,
      SpeakingEvaluationStore evaluations,
      LearnerProfiles profiles,
      IdempotencyExecutor idempotency,
      OutboxPublisher outbox,
      ObjectMapper objectMapper,
      Clock clock) {
    this.topics = topics;
    this.sessions = sessions;
    this.attempts = attempts;
    this.evaluations = evaluations;
    this.profiles = profiles;
    this.idempotency = idempotency;
    this.outbox = outbox;
    this.objectMapper = objectMapper;
    this.clock = clock;
  }

  @Override
  @Transactional(readOnly = true)
  public List<SpeakingTopicView> topics(String category, String level) {
    String normalizedCategory = filter(category, CATEGORIES, "INVALID_SPEAKING_CATEGORY");
    String normalizedLevel = filter(level, LEVELS, "INVALID_SPEAKING_LEVEL");
    return topics.findAvailable(normalizedCategory, normalizedLevel).stream()
        .map(this::topicView)
        .toList();
  }

  @Override
  public StartedSpeakingSession start(UUID userId, UUID idempotencyKey, UUID topicId) {
    var command =
        new IdempotencyCommand(
            userId, "speaking.session.create", idempotencyKey, topicId.toString(), IDEMPOTENCY_TTL);
    IdempotentResponse result = idempotency.execute(command, () -> startFresh(userId, topicId));
    return new StartedSpeakingSession(
        read(result.bodyJson(), SpeakingSessionView.class), result.replayed());
  }

  private IdempotentResponse startFresh(UUID userId, UUID topicId) {
    if (sessions.findActive(userId).isPresent()) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "ACTIVE_SPEAKING_SESSION_EXISTS",
          "An active speaking session already exists");
    }
    SpeakingTopicRecord topic =
        topics
            .findAvailableById(topicId)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "SPEAKING_TOPIC_NOT_FOUND",
                        "Speaking topic not found"));
    SpeakingTopicView snapshot = topicView(topic);
    UUID sessionId = UUID.randomUUID();
    var now = clock.instant();
    sessions.create(
        sessionId, userId, topic, write(snapshot), profiles.get(userId).timezone(), now);
    SpeakingSessionView view =
        sessions.findOwned(sessionId, userId).map(this::sessionView).orElseThrow();
    return IdempotentResponse.fresh(HttpStatus.CREATED.value(), write(view));
  }

  @Override
  @Transactional(readOnly = true)
  public SpeakingSessionView get(UUID userId, UUID sessionId) {
    return sessions.findOwned(sessionId, userId).map(this::sessionView).orElseThrow(this::notFound);
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<SpeakingSessionView> active(UUID userId) {
    return sessions.findActive(userId).map(session -> sessionView(session, true));
  }

  @Override
  @Transactional(readOnly = true)
  public SpeakingSessionHistoryPage history(UUID userId, int page, int size) {
    if (page < 0 || size < 1 || size > 100) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_PAGE_REQUEST",
          "Page must be non-negative and size must be between 1 and 100");
    }
    var result = sessions.findHistory(userId, page, size);
    return new SpeakingSessionHistoryPage(
        result.items().stream().map(session -> sessionView(session, false)).toList(),
        result.page(),
        result.size(),
        result.totalItems(),
        result.totalPages());
  }

  @Override
  public CompletedSpeakingSession complete(
      UUID userId,
      UUID idempotencyKey,
      UUID sessionId,
      UUID selectedAttemptId,
      long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "speaking.session.complete",
            idempotencyKey,
            sessionId + ":" + selectedAttemptId + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(
            command, () -> completeFresh(userId, sessionId, selectedAttemptId, expectedVersion));
    CompletionPayload payload = read(result.bodyJson(), CompletionPayload.class);
    return new CompletedSpeakingSession(
        payload.sessionId(),
        payload.selectedAttemptId(),
        payload.evaluatedAttempts(),
        payload.acceptedDurationSeconds(),
        payload.completedAt(),
        result.replayed());
  }

  private IdempotentResponse completeFresh(
      UUID userId, UUID sessionId, UUID selectedAttemptId, long expectedVersion) {
    SpeakingSessionRecord session =
        sessions.lockOwned(sessionId, userId).orElseThrow(this::notFound);
    List<SpeakingAttemptRecord> sessionAttempts = attempts.findBySessionOwned(sessionId, userId);
    Map<UUID, SpeakingEvaluationRecord> byAttempt = evaluationsByAttempt(sessionAttempts, userId);
    CompletionPayload payload =
        completionPayload(session, selectedAttemptId, sessionAttempts, byAttempt);
    if (session.status() == SpeakingSessionStatus.COMPLETED) {
      if (!selectedAttemptId.equals(session.selectedAttemptId())) throw sessionConflict();
      return IdempotentResponse.fresh(HttpStatus.OK.value(), write(payload));
    }
    if (session.status() != SpeakingSessionStatus.IN_PROGRESS
        || session.version() != expectedVersion) {
      throw sessionConflict();
    }
    if (sessionAttempts.stream()
        .anyMatch(
            attempt ->
                attempt.processingState() == AttemptProcessingState.QUEUED
                    || attempt.processingState() == AttemptProcessingState.RUNNING)) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "SPEAKING_EVALUATION_IN_PROGRESS",
          "Wait for all speaking evaluations to finish before completing the session");
    }
    SpeakingAttemptRecord selected =
        sessionAttempts.stream()
            .filter(attempt -> attempt.id().equals(selectedAttemptId))
            .findFirst()
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.UNPROCESSABLE_CONTENT,
                        "INVALID_SELECTED_ATTEMPT",
                        "Selected attempt does not belong to this speaking session"));
    SpeakingEvaluationRecord selectedEvaluation = byAttempt.get(selected.id());
    if (selected.processingState() != AttemptProcessingState.COMPLETED
        || selectedEvaluation == null
        || selectedEvaluation.status() != SpeakingEvaluationStatus.COMPLETED) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "SELECTED_ATTEMPT_NOT_EVALUATED",
          "Selected attempt must have a completed evaluation");
    }
    var now = clock.instant();
    if (!sessions.complete(session, selectedAttemptId, now)) throw sessionConflict();
    payload = completionPayload(session, selectedAttemptId, sessionAttempts, byAttempt, now);
    outbox.publish(
        new PublishEvent(
            userId,
            "SpeakingSessionCompleted",
            1,
            sessionId,
            now,
            write(
                new SpeakingCompletedEventPayload(
                    sessionId,
                    userId,
                    now,
                    session.timezoneSnapshot(),
                    payload.acceptedDurationSeconds(),
                    successfulAttemptIds(sessionAttempts, byAttempt),
                    "speaking-duration-v1"))));
    return IdempotentResponse.fresh(HttpStatus.OK.value(), write(payload));
  }

  @Override
  public AbandonedSpeakingSession abandon(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "speaking.session.abandon",
            idempotencyKey,
            sessionId + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> abandonFresh(userId, sessionId, expectedVersion));
    return new AbandonedSpeakingSession(result.replayed());
  }

  private IdempotentResponse abandonFresh(UUID userId, UUID sessionId, long expectedVersion) {
    SpeakingSessionRecord session =
        sessions.lockOwned(sessionId, userId).orElseThrow(this::notFound);
    if (session.status() == SpeakingSessionStatus.ABANDONED) {
      return IdempotentResponse.fresh(HttpStatus.NO_CONTENT.value(), "{}");
    }
    if (session.status() != SpeakingSessionStatus.IN_PROGRESS
        || session.version() != expectedVersion
        || !sessions.abandon(session, clock.instant())) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "SPEAKING_SESSION_VERSION_CONFLICT",
          "Speaking session changed; reload it before retrying");
    }
    return IdempotentResponse.fresh(HttpStatus.NO_CONTENT.value(), "{}");
  }

  private SpeakingTopicView topicView(SpeakingTopicRecord topic) {
    return new SpeakingTopicView(
        topic.id(),
        topic.title(),
        topic.category(),
        topic.categoryLabel(),
        topic.level(),
        topic.prompt(),
        read(topic.contentJson(), SpeakingTopicContentView.class),
        topic.revision());
  }

  private SpeakingSessionView sessionView(SpeakingSessionRecord session) {
    return sessionView(session, true);
  }

  private SpeakingSessionView sessionView(SpeakingSessionRecord session, boolean includeAttempts) {
    List<SpeakingAttemptDetailView> attemptViews =
        includeAttempts ? attemptViews(session.id(), session.userId()) : List.of();
    return new SpeakingSessionView(
        session.id(),
        session.status().apiValue(),
        session.timezoneSnapshot(),
        read(session.promptSnapshotJson(), SpeakingTopicView.class),
        session.selectedAttemptId(),
        attemptViews,
        session.version(),
        session.startedAt(),
        session.completedAt());
  }

  private List<SpeakingAttemptDetailView> attemptViews(UUID sessionId, UUID userId) {
    List<SpeakingAttemptRecord> records = attempts.findBySessionOwned(sessionId, userId);
    Map<UUID, SpeakingEvaluationRecord> byAttempt = evaluationsByAttempt(records, userId);
    return records.stream()
        .map(
            attempt ->
                new SpeakingAttemptDetailView(
                    attemptView(attempt), evaluationView(byAttempt.get(attempt.id()))))
        .toList();
  }

  private Map<UUID, SpeakingEvaluationRecord> evaluationsByAttempt(
      List<SpeakingAttemptRecord> records, UUID userId) {
    return evaluations
        .findByAttemptIdsOwned(records.stream().map(SpeakingAttemptRecord::id).toList(), userId)
        .stream()
        .collect(
            Collectors.toUnmodifiableMap(SpeakingEvaluationRecord::attemptId, Function.identity()));
  }

  private SpeakingAttemptView attemptView(SpeakingAttemptRecord attempt) {
    return new SpeakingAttemptView(
        attempt.id(),
        attempt.sessionId(),
        attempt.attemptNumber(),
        attempt.mimeType(),
        attempt.sizeBytes(),
        attempt.durationMs(),
        attempt.audioState().apiValue(),
        attempt.processingState().apiValue(),
        attempt.version(),
        attempt.createdAt());
  }

  private SpeakingEvaluationView evaluationView(SpeakingEvaluationRecord evaluation) {
    if (evaluation == null) return null;
    Object result =
        evaluation.resultJson() == null ? null : read(evaluation.resultJson(), Object.class);
    return new SpeakingEvaluationView(
        evaluation.id(),
        evaluation.attemptId(),
        evaluation.status().apiValue(),
        evaluation.stage().apiValue(),
        evaluation.retryable(),
        evaluation.transcript(),
        result,
        evaluation.source(),
        evaluation.errorCode(),
        evaluation.createdAt(),
        evaluation.updatedAt());
  }

  private CompletionPayload completionPayload(
      SpeakingSessionRecord session,
      UUID selectedAttemptId,
      List<SpeakingAttemptRecord> sessionAttempts,
      Map<UUID, SpeakingEvaluationRecord> byAttempt) {
    return completionPayload(
        session, selectedAttemptId, sessionAttempts, byAttempt, session.completedAt());
  }

  private CompletionPayload completionPayload(
      SpeakingSessionRecord session,
      UUID selectedAttemptId,
      List<SpeakingAttemptRecord> sessionAttempts,
      Map<UUID, SpeakingEvaluationRecord> byAttempt,
      java.time.Instant completedAt) {
    List<SpeakingAttemptRecord> successful = successfulAttempts(sessionAttempts, byAttempt);
    long durationMs = successful.stream().mapToLong(attempt -> attempt.durationMs()).sum();
    int acceptedSeconds = (int) Math.min(Integer.MAX_VALUE, durationMs / 1_000);
    return new CompletionPayload(
        session.id(), selectedAttemptId, successful.size(), acceptedSeconds, completedAt);
  }

  private List<SpeakingAttemptRecord> successfulAttempts(
      List<SpeakingAttemptRecord> sessionAttempts, Map<UUID, SpeakingEvaluationRecord> byAttempt) {
    return sessionAttempts.stream()
        .filter(attempt -> attempt.processingState() == AttemptProcessingState.COMPLETED)
        .filter(attempt -> attempt.durationMs() != null)
        .filter(
            attempt -> {
              SpeakingEvaluationRecord evaluation = byAttempt.get(attempt.id());
              return evaluation != null
                  && evaluation.status() == SpeakingEvaluationStatus.COMPLETED;
            })
        .toList();
  }

  private List<UUID> successfulAttemptIds(
      List<SpeakingAttemptRecord> sessionAttempts, Map<UUID, SpeakingEvaluationRecord> byAttempt) {
    return successfulAttempts(sessionAttempts, byAttempt).stream()
        .map(SpeakingAttemptRecord::id)
        .toList();
  }

  private ApiException sessionConflict() {
    return new ApiException(
        HttpStatus.CONFLICT,
        "SPEAKING_SESSION_VERSION_CONFLICT",
        "Speaking session changed; reload it before retrying");
  }

  private String filter(String value, Set<String> allowed, String code) {
    if (value == null || value.isBlank()) return null;
    if (!allowed.contains(value)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, code, "Speaking topic filter is invalid");
    }
    return value;
  }

  private ApiException notFound() {
    return new ApiException(
        HttpStatus.NOT_FOUND, "SPEAKING_SESSION_NOT_FOUND", "Speaking session not found");
  }

  private String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize speaking session", exception);
    }
  }

  private <T> T read(String value, Class<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize speaking session", exception);
    }
  }

  private record CompletionPayload(
      UUID sessionId,
      UUID selectedAttemptId,
      int evaluatedAttempts,
      int acceptedDurationSeconds,
      java.time.Instant completedAt) {}

  private record SpeakingCompletedEventPayload(
      UUID sessionId,
      UUID userId,
      java.time.Instant completedAt,
      String timezoneSnapshot,
      int acceptedDurationSeconds,
      List<UUID> evaluatedAttemptIds,
      String ruleVersion) {}
}
