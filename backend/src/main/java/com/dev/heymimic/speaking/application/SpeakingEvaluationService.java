package com.dev.heymimic.speaking.application;

import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.platform.application.publicapi.OutboxPublisher;
import com.dev.heymimic.platform.application.publicapi.PaidWorkGuard;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.application.publicapi.QuotaManager;
import com.dev.heymimic.platform.application.publicapi.ReserveQuota;
import com.dev.heymimic.platform.application.publicapi.UserContextChanges;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.application.port.SpeakingEvaluationRecord;
import com.dev.heymimic.speaking.application.port.SpeakingEvaluationStore;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackItem;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackResult;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackStore;
import com.dev.heymimic.speaking.application.port.SpeakingSessionStore;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionResult;
import com.dev.heymimic.speaking.application.publicapi.PreparedSpeakingEvaluation;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluationView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluationWorkflow;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluations;
import com.dev.heymimic.speaking.application.publicapi.StartedSpeakingEvaluation;
import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.AudioState;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStage;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus;
import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
public class SpeakingEvaluationService implements SpeakingEvaluations, SpeakingEvaluationWorkflow {
  private static final String QUOTA_KIND = "SPEAKING_EVALUATION";
  private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(1);
  private final SpeakingSessionStore sessions;
  private final SpeakingAttemptStore attempts;
  private final SpeakingEvaluationStore evaluations;
  private final SpeakingFeedbackStore feedbackItems;
  private final IdempotencyExecutor idempotency;
  private final QuotaManager quotas;
  private final JobQueue jobs;
  private final PaidWorkGuard paidWorkGuard;
  private final OutboxPublisher outbox;
  private final ObjectMapper objectMapper;
  private final Clock clock;
  private final UserContextChanges contextChanges;

  public SpeakingEvaluationService(
      SpeakingSessionStore sessions,
      SpeakingAttemptStore attempts,
      SpeakingEvaluationStore evaluations,
      SpeakingFeedbackStore feedbackItems,
      IdempotencyExecutor idempotency,
      QuotaManager quotas,
      JobQueue jobs,
      PaidWorkGuard paidWorkGuard,
      OutboxPublisher outbox,
      ObjectMapper objectMapper,
      Clock clock) {
    this(
        sessions,
        attempts,
        evaluations,
        feedbackItems,
        idempotency,
        quotas,
        jobs,
        paidWorkGuard,
        outbox,
        objectMapper,
        clock,
        (userId, key, eventId, consumers) -> 0L);
  }

  @org.springframework.beans.factory.annotation.Autowired
  public SpeakingEvaluationService(
      SpeakingSessionStore sessions,
      SpeakingAttemptStore attempts,
      SpeakingEvaluationStore evaluations,
      SpeakingFeedbackStore feedbackItems,
      IdempotencyExecutor idempotency,
      QuotaManager quotas,
      JobQueue jobs,
      PaidWorkGuard paidWorkGuard,
      OutboxPublisher outbox,
      ObjectMapper objectMapper,
      Clock clock,
      UserContextChanges contextChanges) {
    this.sessions = sessions;
    this.attempts = attempts;
    this.evaluations = evaluations;
    this.feedbackItems = feedbackItems;
    this.idempotency = idempotency;
    this.quotas = quotas;
    this.jobs = jobs;
    this.paidWorkGuard = paidWorkGuard;
    this.outbox = outbox;
    this.objectMapper = objectMapper;
    this.clock = clock;
    this.contextChanges = contextChanges;
  }

  @Override
  public StartedSpeakingEvaluation start(UUID userId, UUID idempotencyKey, UUID attemptId) {
    if (!paidWorkGuard.canUsePaidWork(userId)) {
      throw new ApiException(
          HttpStatus.FORBIDDEN,
          "EMAIL_VERIFICATION_REQUIRED",
          "Email verification is required for speaking evaluation");
    }
    var command =
        new IdempotencyCommand(
            userId,
            "speaking.evaluation.create",
            idempotencyKey,
            attemptId.toString(),
            IDEMPOTENCY_TTL);
    IdempotentResponse response = idempotency.execute(command, () -> startFresh(userId, attemptId));
    StartPayload payload = read(response.bodyJson(), StartPayload.class);
    return new StartedSpeakingEvaluation(payload.evaluation(), response.replayed());
  }

  private IdempotentResponse startFresh(UUID userId, UUID attemptId) {
    SpeakingAttemptRecord prepared =
        attempts.findOwned(attemptId, userId).orElseThrow(this::attemptNotFound);
    var session =
        sessions
            .lockOwned(prepared.sessionId(), userId)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "SPEAKING_SESSION_NOT_FOUND",
                        "Speaking session not found"));
    if (session.status() != SpeakingSessionStatus.IN_PROGRESS) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "SPEAKING_SESSION_TERMINAL",
          "Speaking attempts cannot change after the session ends");
    }
    SpeakingAttemptRecord attempt =
        attempts.lockOwned(attemptId, userId).orElseThrow(this::attemptNotFound);
    var existing = evaluations.findByAttemptOwned(attemptId, userId);
    if (existing.isPresent()) {
      return accepted(view(existing.orElseThrow()));
    }
    Instant now = clock.instant();
    if (attempt.audioState() == AudioState.DELETED
        || (attempt.retentionUntil() != null && !attempt.retentionUntil().isAfter(now))) {
      throw new ApiException(
          HttpStatus.GONE, "AUDIO_EXPIRED", "Speaking attempt audio is no longer retained");
    }
    if (attempt.audioState() != AudioState.AVAILABLE
        || attempt.processingState() != AttemptProcessingState.NOT_REQUESTED) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "SPEAKING_ATTEMPT_NOT_EVALUATABLE",
          "Speaking attempt is not ready for evaluation");
    }

    UUID evaluationId = UUID.randomUUID();
    UUID reservationId = quotas.reserve(new ReserveQuota(userId, evaluationId, QUOTA_KIND, 1));
    UUID jobId =
        jobs.enqueue(
            new EnqueueJob(
                userId, SpeakingEvaluationWorkflow.JOB_TYPE, evaluationId, 1, "{}", now));
    evaluations.create(evaluationId, attemptId, userId, jobId, reservationId, now);
    if (!attempts.queueEvaluation(attemptId, userId, attempt.version(), now)) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "SPEAKING_ATTEMPT_VERSION_CONFLICT",
          "Speaking attempt changed; reload it before retrying");
    }
    var created =
        new SpeakingEvaluationRecord(
            evaluationId,
            attemptId,
            userId,
            SpeakingEvaluationStatus.QUEUED,
            SpeakingEvaluationStage.QUEUED,
            null,
            null,
            null,
            jobId,
            reservationId,
            null,
            true,
            false,
            0,
            now,
            now);
    return accepted(view(created));
  }

  @Override
  @Transactional(readOnly = true)
  public SpeakingEvaluationView getByAttempt(UUID userId, UUID attemptId) {
    return evaluations
        .findByAttemptOwned(attemptId, userId)
        .map(this::view)
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND,
                    "SPEAKING_EVALUATION_NOT_FOUND",
                    "Speaking evaluation not found"));
  }

  @Override
  @Transactional
  public Optional<PreparedSpeakingEvaluation> prepare(UUID evaluationId, UUID userId) {
    SpeakingEvaluationRecord evaluation = evaluations.findOwned(evaluationId, userId).orElse(null);
    if (evaluation == null
        || evaluation.status() == SpeakingEvaluationStatus.COMPLETED
        || evaluation.status() == SpeakingEvaluationStatus.FAILED) {
      return Optional.empty();
    }
    SpeakingAttemptRecord attempt =
        attempts.findOwned(evaluation.attemptId(), userId).orElseThrow(this::attemptNotFound);
    var session =
        sessions
            .lockOwned(attempt.sessionId(), userId)
            .orElseThrow(
                () ->
                    new IllegalStateException("Evaluation session ownership became inconsistent"));
    if (session.status() != SpeakingSessionStatus.IN_PROGRESS) {
      failLoaded(evaluation, "SPEAKING_SESSION_TERMINAL", clock.instant());
      return Optional.empty();
    }
    if (attempt.audioState() != AudioState.AVAILABLE
        || attempt.objectVersion() == null
        || attempt.durationMs() == null) {
      failLoaded(evaluation, "AUDIO_NOT_AVAILABLE", clock.instant());
      return Optional.empty();
    }
    if (evaluation.status() == SpeakingEvaluationStatus.QUEUED) {
      Instant now = clock.instant();
      if (!evaluations.begin(evaluationId, userId, now)
          || !attempts.beginEvaluation(attempt.id(), userId, now)) {
        throw new IllegalStateException("Could not begin queued speaking evaluation");
      }
      evaluation =
          evaluations
              .findOwned(evaluationId, userId)
              .orElseThrow(() -> new IllegalStateException("Evaluation disappeared after begin"));
    }
    return Optional.of(prepared(evaluation, attempt, session.promptSnapshotJson()));
  }

  @Override
  @Transactional
  public Optional<PreparedSpeakingEvaluation> saveTranscript(
      PreparedSpeakingEvaluation evaluation, SpeakingTranscriptionResult result) {
    String transcript = validateTranscript(result);
    Instant now = clock.instant();
    if (!evaluations.saveTranscript(evaluation.id(), evaluation.userId(), transcript, now)) {
      SpeakingEvaluationRecord current =
          evaluations.findOwned(evaluation.id(), evaluation.userId()).orElse(null);
      if (current == null || current.status() != SpeakingEvaluationStatus.RUNNING) {
        return Optional.empty();
      }
      if (current.stage() != SpeakingEvaluationStage.FEEDBACK) {
        throw new IllegalStateException("Could not checkpoint speaking transcript");
      }
      transcript = current.transcript();
    }
    return Optional.of(
        new PreparedSpeakingEvaluation(
            evaluation.id(),
            evaluation.userId(),
            evaluation.attemptId(),
            evaluation.sessionId(),
            evaluation.objectKey(),
            evaluation.objectVersion(),
            evaluation.mimeType(),
            evaluation.durationMs(),
            evaluation.promptSnapshotJson(),
            SpeakingEvaluationStage.FEEDBACK,
            transcript,
            evaluation.quotaReservationId()));
  }

  @Override
  @Transactional
  public void complete(PreparedSpeakingEvaluation evaluation, SpeakingFeedbackResult result) {
    ValidatedFeedback validated = validateFeedback(result);
    var session =
        sessions
            .lockOwned(evaluation.sessionId(), evaluation.userId())
            .orElseThrow(
                () ->
                    new IllegalStateException("Evaluation session ownership became inconsistent"));
    Instant now = clock.instant();
    if (session.status() != SpeakingSessionStatus.IN_PROGRESS) {
      SpeakingEvaluationRecord current =
          evaluations
              .findOwned(evaluation.id(), evaluation.userId())
              .orElseThrow(() -> new IllegalStateException("Evaluation disappeared before commit"));
      failLoaded(current, "SPEAKING_SESSION_TERMINAL", now);
      return;
    }
    if (!evaluations.complete(
        evaluation.id(), evaluation.userId(), validated.resultJson(), validated.source(), now)) {
      return;
    }
    feedbackItems.save(evaluation.id(), validated.items(), now);
    if (!attempts.completeEvaluation(evaluation.attemptId(), evaluation.userId(), now)) {
      throw new IllegalStateException("Could not complete speaking attempt processing");
    }
    quotas.consume(evaluation.quotaReservationId(), evaluation.userId());
    UUID eventId =
        outbox.publish(
            new PublishEvent(
                evaluation.userId(),
                "SpeakingEvaluationCompleted",
                1,
                evaluation.id(),
                now,
                write(
                    new SpeakingEvaluationCompletedPayload(
                        evaluation.id(),
                        evaluation.userId(),
                        now,
                        "speaking-feedback-v1",
                        java.util.stream.IntStream.range(0, validated.items().size())
                            .mapToObj(
                                position ->
                                    eventItem(
                                        evaluation.id(), position, validated.items().get(position)))
                            .toList()))));
    contextChanges.record(
        evaluation.userId(),
        UserContextChanges.LEARNING_CONTEXT,
        eventId,
        java.util.List.of("progress-mistake-projection-v1"));
  }

  @Override
  @Transactional(readOnly = true)
  public boolean isCompleted(UUID evaluationId, UUID userId) {
    return evaluations
        .findOwned(evaluationId, userId)
        .filter(evaluation -> evaluation.status() == SpeakingEvaluationStatus.COMPLETED)
        .isPresent();
  }

  @Override
  @Transactional
  public void failFinal(UUID evaluationId, UUID userId, String errorCode) {
    evaluations
        .findOwned(evaluationId, userId)
        .ifPresent(
            evaluation -> failLoaded(evaluation, sanitizeErrorCode(errorCode), clock.instant()));
  }

  private PreparedSpeakingEvaluation prepared(
      SpeakingEvaluationRecord evaluation,
      SpeakingAttemptRecord attempt,
      String promptSnapshotJson) {
    return new PreparedSpeakingEvaluation(
        evaluation.id(),
        evaluation.userId(),
        evaluation.attemptId(),
        attempt.sessionId(),
        attempt.objectKey(),
        attempt.objectVersion(),
        attempt.mimeType(),
        attempt.durationMs(),
        promptSnapshotJson,
        evaluation.stage(),
        evaluation.transcript(),
        evaluation.quotaReservationId());
  }

  private void failLoaded(SpeakingEvaluationRecord evaluation, String errorCode, Instant now) {
    if (evaluations.failFinal(evaluation.id(), evaluation.userId(), errorCode, now)) {
      attempts.failEvaluation(evaluation.attemptId(), evaluation.userId(), now);
      if (evaluation.providerInvoked()) {
        quotas.consume(evaluation.quotaReservationId(), evaluation.userId());
      } else {
        quotas.release(evaluation.quotaReservationId(), evaluation.userId());
      }
    }
  }

  private String validateTranscript(SpeakingTranscriptionResult result) {
    if (result == null
        || !Set.of("fake", "provider").contains(result.source())
        || result.transcript() == null
        || result.transcript().isBlank()
        || result.transcript().length() > 20_000) {
      throw new IllegalArgumentException("Transcription result is invalid");
    }
    return result.transcript().trim();
  }

  private ValidatedFeedback validateFeedback(SpeakingFeedbackResult result) {
    if (result == null
        || !Set.of("fake", "provider").contains(result.source())
        || invalidScore(result.overallScore())
        || (result.wordsPerMinute() != null
            && (result.wordsPerMinute() < 0 || result.wordsPerMinute() > 400))
        || result.strengths() == null
        || result.strengths().size() > 3
        || result.corrections() == null
        || result.corrections().size() > 10) {
      throw new IllegalArgumentException("Speaking feedback result is invalid");
    }
    List<String> strengths = result.strengths().stream().map(this::requiredText).toList();
    List<SpeakingFeedbackItem> items =
        result.corrections().stream().map(this::feedbackItem).toList();
    var payload =
        new EvaluationResultPayload(
            1,
            result.overallScore(),
            result.wordsPerMinute(),
            strengths,
            items,
            result.provider(),
            result.model(),
            requiredText(result.promptVersion()),
            requiredText(result.rubricVersion()));
    return new ValidatedFeedback(result.source(), write(payload), items);
  }

  private SpeakingFeedbackItem feedbackItem(SpeakingFeedbackItem item) {
    if (item == null || !Set.of("GRAMMAR", "VOCABULARY", "EXPRESSION").contains(item.category())) {
      throw new IllegalArgumentException("Speaking feedback category is invalid");
    }
    return new SpeakingFeedbackItem(
        item.category(),
        optionalText(item.originalText(), 2_000),
        optionalText(item.improvedText(), 2_000),
        requiredText(item.note()),
        optionalText(item.patternKey(), 100));
  }

  private String requiredText(String value) {
    if (value == null || value.isBlank() || value.length() > 2_000) {
      throw new IllegalArgumentException("Speaking feedback text is invalid");
    }
    return value.trim();
  }

  private String optionalText(String value, int maxLength) {
    if (value == null) return null;
    if (value.length() > maxLength) {
      throw new IllegalArgumentException("Speaking feedback text is too long");
    }
    return value.trim();
  }

  private boolean invalidScore(Integer score) {
    return score != null && (score < 0 || score > 100);
  }

  private String sanitizeErrorCode(String errorCode) {
    String value = errorCode == null || errorCode.isBlank() ? "UNEXPECTED_ERROR" : errorCode.trim();
    return value.substring(0, Math.min(value.length(), 100));
  }

  private IdempotentResponse accepted(SpeakingEvaluationView evaluation) {
    return IdempotentResponse.fresh(
        HttpStatus.ACCEPTED.value(), write(new StartPayload(evaluation)));
  }

  private SpeakingEvaluationView view(SpeakingEvaluationRecord evaluation) {
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

  private ApiException attemptNotFound() {
    return new ApiException(
        HttpStatus.NOT_FOUND, "SPEAKING_ATTEMPT_NOT_FOUND", "Speaking attempt not found");
  }

  private String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize speaking evaluation", exception);
    }
  }

  private <T> T read(String value, Class<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize speaking evaluation", exception);
    }
  }

  private record StartPayload(SpeakingEvaluationView evaluation) {}

  private record ValidatedFeedback(
      String source, String resultJson, List<SpeakingFeedbackItem> items) {}

  private FeedbackEventItem eventItem(UUID evaluationId, int position, SpeakingFeedbackItem item) {
    return new FeedbackEventItem(
        SpeakingFeedbackIdentity.id(evaluationId, position),
        item.category(),
        item.patternKey(),
        item.note(),
        item.originalText(),
        item.improvedText());
  }

  private record SpeakingEvaluationCompletedPayload(
      UUID evaluationId,
      UUID userId,
      Instant completedAt,
      String taxonomyVersion,
      List<FeedbackEventItem> feedbackItems) {}

  private record FeedbackEventItem(
      UUID feedbackItemId,
      String category,
      String patternKey,
      String note,
      String originalText,
      String improvedText) {}

  private record EvaluationResultPayload(
      int schemaVersion,
      Integer overallScore,
      Integer wordsPerMinute,
      List<String> strengths,
      List<SpeakingFeedbackItem> corrections,
      String provider,
      String model,
      String promptVersion,
      String rubricVersion) {}
}
