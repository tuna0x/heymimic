package com.dev.heymimic.speaking.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.platform.application.publicapi.OutboxPublisher;
import com.dev.heymimic.platform.application.publicapi.PaidWorkGuard;
import com.dev.heymimic.platform.application.publicapi.QuotaManager;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.application.port.SpeakingEvaluationRecord;
import com.dev.heymimic.speaking.application.port.SpeakingEvaluationStore;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackItem;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackResult;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackStore;
import com.dev.heymimic.speaking.application.port.SpeakingSessionRecord;
import com.dev.heymimic.speaking.application.port.SpeakingSessionStore;
import com.dev.heymimic.speaking.domain.AttemptProcessingState;
import com.dev.heymimic.speaking.domain.AudioState;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStage;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStatus;
import com.dev.heymimic.speaking.domain.SpeakingSessionStatus;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class SpeakingEvaluationServiceTest {
  private static final UUID USER_ID = UUID.randomUUID();
  private static final UUID SESSION_ID = UUID.randomUUID();
  private static final UUID ATTEMPT_ID = UUID.randomUUID();
  private static final UUID IDEMPOTENCY_KEY = UUID.randomUUID();
  private static final UUID RESERVATION_ID = UUID.randomUUID();
  private static final UUID JOB_ID = UUID.randomUUID();
  private static final Instant NOW = Instant.parse("2026-09-08T03:00:00Z");
  private final SpeakingSessionStore sessions = mock(SpeakingSessionStore.class);
  private final SpeakingAttemptStore attempts = mock(SpeakingAttemptStore.class);
  private final SpeakingEvaluationStore evaluations = mock(SpeakingEvaluationStore.class);
  private final SpeakingFeedbackStore feedbackItems = mock(SpeakingFeedbackStore.class);
  private final IdempotencyExecutor idempotency = mock(IdempotencyExecutor.class);
  private final QuotaManager quotas = mock(QuotaManager.class);
  private final JobQueue jobs = mock(JobQueue.class);
  private final PaidWorkGuard paidWorkGuard = mock(PaidWorkGuard.class);
  private final OutboxPublisher outbox = mock(OutboxPublisher.class);
  private final SpeakingEvaluationService service =
      new SpeakingEvaluationService(
          sessions,
          attempts,
          evaluations,
          feedbackItems,
          idempotency,
          quotas,
          jobs,
          paidWorkGuard,
          outbox,
          new ObjectMapper(),
          Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void rejectsUnverifiedAccountBeforeIdempotencyAndQuota() {
    when(paidWorkGuard.canUsePaidWork(USER_ID)).thenReturn(false);

    assertThatThrownBy(() -> service.start(USER_ID, IDEMPOTENCY_KEY, ATTEMPT_ID))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("EMAIL_VERIFICATION_REQUIRED"));
    verify(idempotency, never()).execute(any(), any());
    verify(quotas, never()).reserve(any());
  }

  @Test
  @SuppressWarnings("unchecked")
  void reservesQuotaEnqueuesJobAndQueuesAvailableAttemptAtomically() {
    SpeakingAttemptRecord attempt = attempt();
    when(paidWorkGuard.canUsePaidWork(USER_ID)).thenReturn(true);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(attempts.findOwned(ATTEMPT_ID, USER_ID)).thenReturn(Optional.of(attempt));
    when(sessions.lockOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(attempts.lockOwned(ATTEMPT_ID, USER_ID)).thenReturn(Optional.of(attempt));
    when(quotas.reserve(any())).thenReturn(RESERVATION_ID);
    when(jobs.enqueue(any())).thenReturn(JOB_ID);
    when(attempts.queueEvaluation(ATTEMPT_ID, USER_ID, 4, NOW)).thenReturn(true);

    var started = service.start(USER_ID, IDEMPOTENCY_KEY, ATTEMPT_ID);

    assertThat(started.evaluation().status()).isEqualTo("queued");
    assertThat(started.evaluation().stage()).isEqualTo("queued");
    assertThat(started.replayed()).isFalse();
    verify(evaluations)
        .create(
            eq(started.evaluation().id()),
            eq(ATTEMPT_ID),
            eq(USER_ID),
            eq(JOB_ID),
            eq(RESERVATION_ID),
            eq(NOW));
    verify(attempts).queueEvaluation(ATTEMPT_ID, USER_ID, 4, NOW);
  }

  @Test
  @SuppressWarnings("unchecked")
  void aNewIdempotencyKeyReusesTheSingleEvaluationForAnAttempt() {
    SpeakingAttemptRecord attempt = attempt();
    SpeakingEvaluationRecord existing = evaluation();
    when(paidWorkGuard.canUsePaidWork(USER_ID)).thenReturn(true);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(attempts.findOwned(ATTEMPT_ID, USER_ID)).thenReturn(Optional.of(attempt));
    when(sessions.lockOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(attempts.lockOwned(ATTEMPT_ID, USER_ID)).thenReturn(Optional.of(attempt));
    when(evaluations.findByAttemptOwned(ATTEMPT_ID, USER_ID)).thenReturn(Optional.of(existing));

    var started = service.start(USER_ID, IDEMPOTENCY_KEY, ATTEMPT_ID);

    assertThat(started.evaluation().id()).isEqualTo(existing.id());
    verify(quotas, never()).reserve(any());
    verify(jobs, never()).enqueue(any());
  }

  @Test
  void finalFailureBeforeProviderUpdatesEvaluationAndAttemptBeforeReleasingQuota() {
    SpeakingEvaluationRecord evaluation = evaluation();
    when(evaluations.findOwned(evaluation.id(), USER_ID)).thenReturn(Optional.of(evaluation));
    when(evaluations.failFinal(evaluation.id(), USER_ID, "REMOTE_UNAVAILABLE", NOW))
        .thenReturn(true);

    service.failFinal(evaluation.id(), USER_ID, "REMOTE_UNAVAILABLE");

    var ordered = org.mockito.Mockito.inOrder(evaluations, attempts, quotas);
    ordered.verify(evaluations).failFinal(evaluation.id(), USER_ID, "REMOTE_UNAVAILABLE", NOW);
    ordered.verify(attempts).failEvaluation(ATTEMPT_ID, USER_ID, NOW);
    ordered.verify(quotas).release(RESERVATION_ID, USER_ID);
  }

  @Test
  void prepareMovesQueuedEvaluationAndAttemptToRunningBeforeProviderCall() {
    SpeakingEvaluationRecord queued = evaluation();
    SpeakingEvaluationRecord running =
        new SpeakingEvaluationRecord(
            queued.id(),
            ATTEMPT_ID,
            USER_ID,
            SpeakingEvaluationStatus.RUNNING,
            SpeakingEvaluationStage.TRANSCRIBING,
            null,
            null,
            null,
            JOB_ID,
            RESERVATION_ID,
            null,
            true,
            true,
            1,
            NOW,
            NOW);
    when(evaluations.findOwned(queued.id(), USER_ID))
        .thenReturn(Optional.of(queued), Optional.of(running));
    when(attempts.findOwned(ATTEMPT_ID, USER_ID)).thenReturn(Optional.of(attempt()));
    when(sessions.lockOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(evaluations.begin(queued.id(), USER_ID, NOW)).thenReturn(true);
    when(attempts.beginEvaluation(ATTEMPT_ID, USER_ID, NOW)).thenReturn(true);

    var prepared = service.prepare(queued.id(), USER_ID).orElseThrow();

    assertThat(prepared.stage()).isEqualTo(SpeakingEvaluationStage.TRANSCRIBING);
    assertThat(prepared.objectVersion()).isEqualTo("object-v1");
    verify(evaluations).begin(queued.id(), USER_ID, NOW);
    verify(attempts).beginEvaluation(ATTEMPT_ID, USER_ID, NOW);
  }

  @Test
  void completionPersistsValidatedFeedbackAndAttemptBeforeConsumingQuota() {
    var prepared =
        new com.dev.heymimic.speaking.application.publicapi.PreparedSpeakingEvaluation(
            UUID.randomUUID(),
            USER_ID,
            ATTEMPT_ID,
            SESSION_ID,
            "speaking/object",
            "object-v1",
            "audio/webm",
            12_000,
            "{}",
            SpeakingEvaluationStage.FEEDBACK,
            "A persisted transcript",
            RESERVATION_ID);
    var correction =
        new SpeakingFeedbackItem(
            "GRAMMAR", "I go yesterday", "I went yesterday", "Use past tense.", "grammar.past");
    var result =
        new SpeakingFeedbackResult(
            "fake",
            75,
            100,
            List.of("Clear structure"),
            List.of(correction),
            "fixture",
            "v1",
            "prompt-v1",
            "rubric-v1");
    when(sessions.lockOwned(SESSION_ID, USER_ID)).thenReturn(Optional.of(session()));
    when(evaluations.complete(eq(prepared.id()), eq(USER_ID), any(), eq("fake"), eq(NOW)))
        .thenReturn(true);
    when(attempts.completeEvaluation(ATTEMPT_ID, USER_ID, NOW)).thenReturn(true);

    service.complete(prepared, result);

    var ordered = org.mockito.Mockito.inOrder(evaluations, feedbackItems, attempts, quotas);
    ordered
        .verify(evaluations)
        .complete(eq(prepared.id()), eq(USER_ID), any(), eq("fake"), eq(NOW));
    ordered.verify(feedbackItems).save(prepared.id(), List.of(correction), NOW);
    ordered.verify(attempts).completeEvaluation(ATTEMPT_ID, USER_ID, NOW);
    ordered.verify(quotas).consume(RESERVATION_ID, USER_ID);
    verify(outbox).publish(any());
  }

  private SpeakingAttemptRecord attempt() {
    return new SpeakingAttemptRecord(
        ATTEMPT_ID,
        SESSION_ID,
        1,
        "speaking/object",
        "object-v1",
        "a".repeat(64),
        4096,
        "audio/webm",
        12_000L,
        AudioState.AVAILABLE,
        AttemptProcessingState.NOT_REQUESTED,
        NOW.minusSeconds(600),
        NOW.plusSeconds(604_800),
        4,
        NOW.minusSeconds(600));
  }

  private SpeakingSessionRecord session() {
    return new SpeakingSessionRecord(
        SESSION_ID,
        USER_ID,
        UUID.randomUUID(),
        1,
        "{}",
        "Asia/Bangkok",
        SpeakingSessionStatus.IN_PROGRESS,
        null,
        0,
        NOW.minusSeconds(600),
        null);
  }

  private SpeakingEvaluationRecord evaluation() {
    return new SpeakingEvaluationRecord(
        UUID.randomUUID(),
        ATTEMPT_ID,
        USER_ID,
        SpeakingEvaluationStatus.QUEUED,
        SpeakingEvaluationStage.QUEUED,
        null,
        null,
        null,
        JOB_ID,
        RESERVATION_ID,
        null,
        true,
        false,
        0,
        NOW,
        NOW);
  }
}
