package com.dev.heymimic.study.application;

import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.publicapi.SpeakingPractice;
import com.dev.heymimic.study.application.port.NewStudyStep;
import com.dev.heymimic.study.application.port.StudySessionRecord;
import com.dev.heymimic.study.application.port.StudySessionStore;
import com.dev.heymimic.study.application.port.StudyStepRecord;
import com.dev.heymimic.study.application.publicapi.AbandonedStudySession;
import com.dev.heymimic.study.application.publicapi.CompletedStudySession;
import com.dev.heymimic.study.application.publicapi.PlannedStudyStep;
import com.dev.heymimic.study.application.publicapi.StartedStudySession;
import com.dev.heymimic.study.application.publicapi.StudySessionView;
import com.dev.heymimic.study.application.publicapi.StudySessions;
import com.dev.heymimic.study.application.publicapi.StudyStepView;
import com.dev.heymimic.study.domain.StudySessionStatus;
import com.dev.heymimic.study.domain.StudyStepKind;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessions;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class StudySessionService implements StudySessions {
  private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(1);
  private static final int MAX_REVIEW_WORDS = 50;
  private final StudySessionStore sessions;
  private final ReviewSessions reviews;
  private final SpeakingPractice speaking;
  private final LearnerProfiles profiles;
  private final IdempotencyExecutor idempotency;
  private final ObjectMapper objectMapper;
  private final Clock clock;

  public StudySessionService(
      StudySessionStore sessions,
      ReviewSessions reviews,
      SpeakingPractice speaking,
      LearnerProfiles profiles,
      IdempotencyExecutor idempotency,
      ObjectMapper objectMapper,
      Clock clock) {
    this.sessions = sessions;
    this.reviews = reviews;
    this.speaking = speaking;
    this.profiles = profiles;
    this.idempotency = idempotency;
    this.objectMapper = objectMapper;
    this.clock = clock;
  }

  @Override
  @Transactional
  public StartedStudySession start(
      UUID userId, UUID idempotencyKey, List<PlannedStudyStep> requestedSteps) {
    List<NormalizedStep> plan = normalize(requestedSteps);
    var command =
        new IdempotencyCommand(
            userId, "study.session.create", idempotencyKey, write(plan), IDEMPOTENCY_TTL);
    IdempotentResponse response =
        idempotency.execute(command, () -> startFresh(userId, idempotencyKey, plan));
    return new StartedStudySession(
        read(response.bodyJson(), StudySessionView.class), response.replayed());
  }

  private IdempotentResponse startFresh(UUID userId, UUID requestKey, List<NormalizedStep> plan) {
    if (sessions.findActive(userId).isPresent()
        || reviews.active(userId).isPresent()
        || speaking.active(userId).isPresent()) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "ACTIVE_SESSION_EXISTS",
          "Finish or abandon the active learning session before starting another");
    }
    UUID sessionId = UUID.randomUUID();
    Instant now = clock.instant();
    sessions.create(sessionId, userId, profiles.get(userId).timezone(), now);
    List<NewStudyStep> createdSteps =
        plan.stream().map(step -> createChild(userId, requestKey, sessionId, step)).toList();
    sessions.addSteps(sessionId, createdSteps, now);
    StudySessionView view = sessions.findOwned(sessionId, userId).map(this::view).orElseThrow();
    return IdempotentResponse.fresh(HttpStatus.CREATED.value(), write(view));
  }

  private NewStudyStep createChild(
      UUID userId, UUID requestKey, UUID studySessionId, NormalizedStep step) {
    UUID childKey =
        UUID.nameUUIDFromBytes(
            (userId + ":" + requestKey + ":" + studySessionId + ":" + step.position())
                .getBytes(StandardCharsets.UTF_8));
    if (step.kind() == StudyStepKind.VOCABULARY) {
      UUID childId = reviews.start(userId, childKey, step.wordIds()).session().id();
      return new NewStudyStep(UUID.randomUUID(), step.position(), step.kind(), childId, null);
    }
    UUID childId = speaking.start(userId, childKey, step.topicId()).session().id();
    return new NewStudyStep(UUID.randomUUID(), step.position(), step.kind(), null, childId);
  }

  @Override
  @Transactional(readOnly = true)
  public StudySessionView get(UUID userId, UUID sessionId) {
    return sessions.findOwned(sessionId, userId).map(this::view).orElseThrow(this::notFound);
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<StudySessionView> active(UUID userId) {
    return sessions.findActive(userId).map(this::view);
  }

  @Override
  @Transactional
  public StudySessionView advance(
      UUID userId, UUID sessionId, int targetStep, long expectedVersion) {
    StudySessionRecord session = sessions.lockOwned(sessionId, userId).orElseThrow(this::notFound);
    requireMutableVersion(session, expectedVersion);
    List<ChildState> children = childStates(session);
    if (targetStep != session.currentStep() + 1 || targetStep >= children.size()) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "INVALID_STUDY_STEP_TRANSITION",
          "Study can only advance to the next planned step");
    }
    ChildState current = children.get(session.currentStep());
    if (!"completed".equals(current.status())) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "STUDY_CHILD_NOT_COMPLETED",
          "Complete the current learning step before advancing");
    }
    Instant now = clock.instant();
    if (!sessions.advance(session, targetStep, now)) throw versionConflict();
    return view(
        new StudySessionRecord(
            session.id(),
            session.userId(),
            session.status(),
            session.timezoneSnapshot(),
            targetStep,
            session.version() + 1,
            session.startedAt(),
            session.completedAt()),
        children);
  }

  @Override
  @Transactional
  public CompletedStudySession complete(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "study.session.complete",
            idempotencyKey,
            sessionId + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse response =
        idempotency.execute(command, () -> completeFresh(userId, sessionId, expectedVersion));
    return new CompletedStudySession(
        read(response.bodyJson(), StudySessionView.class), response.replayed());
  }

  private IdempotentResponse completeFresh(UUID userId, UUID sessionId, long expectedVersion) {
    StudySessionRecord session = sessions.lockOwned(sessionId, userId).orElseThrow(this::notFound);
    List<ChildState> children = childStates(session);
    if (session.status() == StudySessionStatus.COMPLETED) {
      return IdempotentResponse.fresh(HttpStatus.OK.value(), write(view(session, children)));
    }
    requireMutableVersion(session, expectedVersion);
    if (children.isEmpty()
        || children.stream().anyMatch(child -> !"completed".equals(child.status()))) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "STUDY_CHILD_NOT_COMPLETED",
          "Every planned learning step must be completed first");
    }
    Instant now = clock.instant();
    if (!sessions.complete(session, now)) throw versionConflict();
    StudySessionRecord completed =
        new StudySessionRecord(
            session.id(),
            session.userId(),
            StudySessionStatus.COMPLETED,
            session.timezoneSnapshot(),
            session.currentStep(),
            session.version() + 1,
            session.startedAt(),
            now);
    return IdempotentResponse.fresh(HttpStatus.OK.value(), write(view(completed, children)));
  }

  @Override
  @Transactional
  public AbandonedStudySession abandon(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "study.session.abandon",
            idempotencyKey,
            sessionId + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse response =
        idempotency.execute(command, () -> abandonFresh(userId, sessionId, expectedVersion));
    return new AbandonedStudySession(response.replayed());
  }

  private IdempotentResponse abandonFresh(UUID userId, UUID sessionId, long expectedVersion) {
    StudySessionRecord session = sessions.lockOwned(sessionId, userId).orElseThrow(this::notFound);
    if (session.status() == StudySessionStatus.ABANDONED) {
      return IdempotentResponse.fresh(HttpStatus.NO_CONTENT.value(), "{}");
    }
    requireMutableVersion(session, expectedVersion);
    List<ChildState> children = childStates(session);
    children.stream()
        .filter(child -> "inProgress".equals(child.status()))
        .forEach(child -> abandonChild(userId, session.id(), child));
    if (!sessions.abandon(session, clock.instant())) throw versionConflict();
    return IdempotentResponse.fresh(HttpStatus.NO_CONTENT.value(), "{}");
  }

  private void abandonChild(UUID userId, UUID studySessionId, ChildState child) {
    UUID childKey =
        UUID.nameUUIDFromBytes(
            (userId + ":" + studySessionId + ":abandon:" + child.step().position())
                .getBytes(StandardCharsets.UTF_8));
    if (child.step().kind() == StudyStepKind.VOCABULARY) {
      reviews.abandon(userId, childKey, child.step().reviewSessionId(), child.version());
    } else {
      speaking.abandon(userId, childKey, child.step().speakingSessionId(), child.version());
    }
  }

  private void requireMutableVersion(StudySessionRecord session, long expectedVersion) {
    if (session.status() != StudySessionStatus.IN_PROGRESS
        || session.version() != expectedVersion) {
      throw versionConflict();
    }
  }

  private ApiException versionConflict() {
    return new ApiException(
        HttpStatus.CONFLICT,
        "STUDY_SESSION_VERSION_CONFLICT",
        "Study session changed; reload it before retrying");
  }

  private StudySessionView view(StudySessionRecord session) {
    return view(session, childStates(session));
  }

  private StudySessionView view(StudySessionRecord session, List<ChildState> children) {
    List<StudyStepView> steps = children.stream().map(this::stepView).toList();
    return new StudySessionView(
        session.id(),
        session.status().apiValue(),
        session.timezoneSnapshot(),
        session.currentStep(),
        session.version(),
        session.startedAt(),
        session.completedAt(),
        steps);
  }

  private List<ChildState> childStates(StudySessionRecord session) {
    return sessions.findSteps(session.id()).stream()
        .map(step -> childState(session.userId(), step))
        .toList();
  }

  private ChildState childState(UUID userId, StudyStepRecord step) {
    if (step.kind() == StudyStepKind.VOCABULARY) {
      var child = reviews.get(userId, step.reviewSessionId());
      return new ChildState(step, child.status(), child.version());
    }
    var child = speaking.get(userId, step.speakingSessionId());
    return new ChildState(step, child.status(), child.version());
  }

  private StudyStepView stepView(ChildState child) {
    StudyStepRecord step = child.step();
    return new StudyStepView(
        step.position(),
        step.kind().apiValue(),
        step.reviewSessionId(),
        step.speakingSessionId(),
        child.status());
  }

  private List<NormalizedStep> normalize(List<PlannedStudyStep> requested) {
    if (requested == null || requested.isEmpty() || requested.size() > 2) {
      throw invalidPlan("Study plan must contain one or two steps");
    }
    List<NormalizedStep> steps =
        java.util.stream.IntStream.range(0, requested.size())
            .mapToObj(position -> normalize(position, requested.get(position)))
            .toList();
    List<StudyStepKind> kinds = steps.stream().map(NormalizedStep::kind).toList();
    if (!(kinds.equals(List.of(StudyStepKind.VOCABULARY))
        || kinds.equals(List.of(StudyStepKind.SPEAKING))
        || kinds.equals(List.of(StudyStepKind.VOCABULARY, StudyStepKind.SPEAKING)))) {
      throw invalidPlan(
          "Study plan must be vocabulary, speaking, or vocabulary followed by speaking");
    }
    return steps;
  }

  private NormalizedStep normalize(int position, PlannedStudyStep requested) {
    if (requested == null) throw invalidPlan("Study step is required");
    StudyStepKind kind;
    try {
      kind = StudyStepKind.fromApiValue(requested.kind());
    } catch (IllegalArgumentException exception) {
      throw invalidPlan(exception.getMessage());
    }
    List<UUID> requestedWordIds = requested.wordIds() == null ? List.of() : requested.wordIds();
    if (requestedWordIds.size() > MAX_REVIEW_WORDS
        || requestedWordIds.stream().anyMatch(java.util.Objects::isNull)
        || new HashSet<>(requestedWordIds).size() != requestedWordIds.size()) {
      throw invalidPlan("Vocabulary step word IDs must be unique and contain at most 50 values");
    }
    List<UUID> wordIds = List.copyOf(requestedWordIds);
    if (kind == StudyStepKind.VOCABULARY && requested.topicId() != null) {
      throw invalidPlan("Vocabulary step cannot contain topicId");
    }
    if (kind == StudyStepKind.SPEAKING && (requested.topicId() == null || !wordIds.isEmpty())) {
      throw invalidPlan("Speaking step requires topicId and cannot contain wordIds");
    }
    return new NormalizedStep(position, kind, wordIds, requested.topicId());
  }

  private ApiException invalidPlan(String message) {
    return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STUDY_PLAN", message);
  }

  private ApiException notFound() {
    return new ApiException(
        HttpStatus.NOT_FOUND, "STUDY_SESSION_NOT_FOUND", "Study session not found");
  }

  private String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize study session", exception);
    }
  }

  private <T> T read(String value, Class<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize study session", exception);
    }
  }

  private record NormalizedStep(
      int position, StudyStepKind kind, List<UUID> wordIds, UUID topicId) {}

  private record ChildState(StudyStepRecord step, String status, long version) {}
}
