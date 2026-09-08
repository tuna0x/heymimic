package com.dev.heymimic.speaking.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.learner.application.publicapi.LearnerProfileView;
import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
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
import com.dev.heymimic.speaking.application.publicapi.SpeakingTopicContentView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingTopicView;
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
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.ObjectMapper;

class SpeakingSessionServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
  private static final UUID IDEMPOTENCY_KEY =
      UUID.fromString("00000000-0000-0000-0000-000000000222");
  private static final Instant NOW = Instant.parse("2026-09-08T02:00:00Z");
  private final SpeakingTopicStore topics = mock(SpeakingTopicStore.class);
  private final SpeakingSessionStore sessions = mock(SpeakingSessionStore.class);
  private final SpeakingAttemptStore attempts = mock(SpeakingAttemptStore.class);
  private final SpeakingEvaluationStore evaluations = mock(SpeakingEvaluationStore.class);
  private final LearnerProfiles profiles = mock(LearnerProfiles.class);
  private final IdempotencyExecutor idempotency = mock(IdempotencyExecutor.class);
  private final OutboxPublisher outbox = mock(OutboxPublisher.class);
  private final ObjectMapper objectMapper = new ObjectMapper();
  private final SpeakingSessionService service =
      new SpeakingSessionService(
          topics,
          sessions,
          attempts,
          evaluations,
          profiles,
          idempotency,
          outbox,
          objectMapper,
          Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  @SuppressWarnings("unchecked")
  void createsIdempotentSessionWithTopicAndTimezoneSnapshots() throws Exception {
    SpeakingTopicRecord topic = topic();
    var topicView =
        new SpeakingTopicView(
            topic.id(),
            topic.title(),
            topic.category(),
            topic.categoryLabel(),
            topic.level(),
            topic.prompt(),
            objectMapper.readValue(topic.contentJson(), SpeakingTopicContentView.class),
            topic.revision());
    String snapshot = objectMapper.writeValueAsString(topicView);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(topics.findAvailableById(topic.id())).thenReturn(Optional.of(topic));
    when(profiles.get(USER_ID))
        .thenReturn(
            new LearnerProfileView(
                USER_ID, "Tuna", "en", "work", "intermediate", 10, "Asia/Bangkok", true, 1));
    when(sessions.findOwned(any(), eq(USER_ID)))
        .thenAnswer(
            invocation ->
                Optional.of(
                    new SpeakingSessionRecord(
                        invocation.getArgument(0, UUID.class),
                        USER_ID,
                        topic.id(),
                        topic.revision(),
                        snapshot,
                        "Asia/Bangkok",
                        SpeakingSessionStatus.IN_PROGRESS,
                        null,
                        0,
                        NOW,
                        null)));

    var started = service.start(USER_ID, IDEMPOTENCY_KEY, topic.id());

    assertThat(started.session().topic()).isEqualTo(topicView);
    assertThat(started.session().timezoneSnapshot()).isEqualTo("Asia/Bangkok");
    assertThat(started.session().status()).isEqualTo("inProgress");
    verify(sessions)
        .create(
            eq(started.session().id()),
            eq(USER_ID),
            eq(topic),
            eq(snapshot),
            eq("Asia/Bangkok"),
            eq(NOW));
  }

  @Test
  void getDoesNotRevealAnotherUsersSpeakingSession() {
    UUID sessionId = UUID.randomUUID();
    when(sessions.findOwned(sessionId, USER_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.get(USER_ID, sessionId))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("SPEAKING_SESSION_NOT_FOUND"));
  }

  @Test
  @SuppressWarnings("unchecked")
  void abandonUsesVersionedTerminalTransition() {
    UUID sessionId = UUID.randomUUID();
    var session =
        new SpeakingSessionRecord(
            sessionId,
            USER_ID,
            topic().id(),
            1,
            "{}",
            "Asia/Bangkok",
            SpeakingSessionStatus.IN_PROGRESS,
            null,
            2,
            NOW,
            null);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.abandon(session, NOW)).thenReturn(true);

    var abandoned = service.abandon(USER_ID, IDEMPOTENCY_KEY, sessionId, 2);

    assertThat(abandoned.replayed()).isFalse();
    verify(sessions).abandon(session, NOW);
  }

  @Test
  @SuppressWarnings("unchecked")
  void completesWithAllSuccessfullyEvaluatedDurationAndPublishesOneEvent() {
    UUID sessionId = UUID.randomUUID();
    UUID selectedAttemptId = UUID.randomUUID();
    UUID secondAttemptId = UUID.randomUUID();
    var session = session(sessionId, SpeakingSessionStatus.IN_PROGRESS, null, 2, null);
    var selected =
        attempt(selectedAttemptId, sessionId, 1, 12_500L, AttemptProcessingState.COMPLETED);
    var second = attempt(secondAttemptId, sessionId, 2, 8_900L, AttemptProcessingState.COMPLETED);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(attempts.findBySessionOwned(sessionId, USER_ID)).thenReturn(List.of(selected, second));
    when(evaluations.findByAttemptIdsOwned(List.of(selectedAttemptId, secondAttemptId), USER_ID))
        .thenReturn(List.of(evaluation(selectedAttemptId), evaluation(secondAttemptId)));
    when(sessions.complete(session, selectedAttemptId, NOW)).thenReturn(true);

    var completed = service.complete(USER_ID, IDEMPOTENCY_KEY, sessionId, selectedAttemptId, 2);

    assertThat(completed.evaluatedAttempts()).isEqualTo(2);
    assertThat(completed.acceptedDurationSeconds()).isEqualTo(21);
    assertThat(completed.completedAt()).isEqualTo(NOW);
    verify(sessions).complete(session, selectedAttemptId, NOW);
    var event = ArgumentCaptor.forClass(PublishEvent.class);
    verify(outbox).publish(event.capture());
    assertThat(event.getValue().eventType()).isEqualTo("SpeakingSessionCompleted");
    assertThat(event.getValue().aggregateId()).isEqualTo(sessionId);
    assertThat(event.getValue().payloadJson())
        .contains("acceptedDurationSeconds", ":21")
        .contains(selectedAttemptId.toString())
        .contains(secondAttemptId.toString());
  }

  @Test
  @SuppressWarnings("unchecked")
  void refusesCompletionWhileAnEvaluationIsStillQueued() {
    UUID sessionId = UUID.randomUUID();
    UUID attemptId = UUID.randomUUID();
    var session = session(sessionId, SpeakingSessionStatus.IN_PROGRESS, null, 2, null);
    var queued = attempt(attemptId, sessionId, 1, 12_000L, AttemptProcessingState.QUEUED);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(attempts.findBySessionOwned(sessionId, USER_ID)).thenReturn(List.of(queued));
    when(evaluations.findByAttemptIdsOwned(List.of(attemptId), USER_ID)).thenReturn(List.of());

    assertThatThrownBy(() -> service.complete(USER_ID, IDEMPOTENCY_KEY, sessionId, attemptId, 2))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("SPEAKING_EVALUATION_IN_PROGRESS"));
    verify(sessions, never()).complete(any(), any(), any());
    verify(outbox, never()).publish(any());
  }

  private SpeakingSessionRecord session(
      UUID sessionId,
      SpeakingSessionStatus status,
      UUID selectedAttemptId,
      long version,
      Instant completedAt) {
    return new SpeakingSessionRecord(
        sessionId,
        USER_ID,
        topic().id(),
        1,
        "{}",
        "Asia/Bangkok",
        status,
        selectedAttemptId,
        version,
        NOW,
        completedAt);
  }

  private SpeakingAttemptRecord attempt(
      UUID attemptId,
      UUID sessionId,
      int attemptNumber,
      Long durationMs,
      AttemptProcessingState processingState) {
    return new SpeakingAttemptRecord(
        attemptId,
        sessionId,
        attemptNumber,
        "speaking/attempt.webm",
        "v1",
        "checksum",
        4_096,
        "audio/webm",
        durationMs,
        AudioState.AVAILABLE,
        processingState,
        NOW.plusSeconds(600),
        NOW.plusSeconds(86_400),
        1,
        NOW);
  }

  private SpeakingEvaluationRecord evaluation(UUID attemptId) {
    return new SpeakingEvaluationRecord(
        UUID.randomUUID(),
        attemptId,
        USER_ID,
        SpeakingEvaluationStatus.COMPLETED,
        SpeakingEvaluationStage.COMPLETED,
        "Transcript",
        "{%coverallScore%c:80}".formatted(34, 34),
        "fake",
        UUID.randomUUID(),
        UUID.randomUUID(),
        null,
        false,
        true,
        2,
        NOW,
        NOW);
  }

  private SpeakingTopicRecord topic() {
    return new SpeakingTopicRecord(
        UUID.fromString("10000000-0000-0000-0000-000000000001"),
        "Project update",
        "work",
        "Work",
        "B1-B2",
        "Share an update",
        """
        {"contextDescription":"Standup","starterSentence":"Yesterday...",
         "outline":["Yesterday","Today","Blockers"],
         "keyVocabulary":[{"word":"blocker","meaning":"obstacle"}],
         "modelAnswer":"Yesterday I completed the API."}
        """,
        1);
  }
}
