package com.dev.heymimic.study.application;

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
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.publicapi.SpeakingPractice;
import com.dev.heymimic.speaking.application.publicapi.SpeakingSessionView;
import com.dev.heymimic.speaking.application.publicapi.StartedSpeakingSession;
import com.dev.heymimic.study.application.port.NewStudyStep;
import com.dev.heymimic.study.application.port.StudySessionRecord;
import com.dev.heymimic.study.application.port.StudySessionStore;
import com.dev.heymimic.study.application.port.StudyStepRecord;
import com.dev.heymimic.study.application.publicapi.PlannedStudyStep;
import com.dev.heymimic.study.domain.StudySessionStatus;
import com.dev.heymimic.study.domain.StudyStepKind;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessionView;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessions;
import com.dev.heymimic.vocabulary.application.publicapi.StartedReviewSession;
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

class StudySessionServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
  private static final UUID REQUEST_KEY = UUID.fromString("00000000-0000-0000-0000-000000000222");
  private static final UUID WORD_ID = UUID.fromString("00000000-0000-0000-0000-000000000333");
  private static final UUID TOPIC_ID = UUID.fromString("00000000-0000-0000-0000-000000000444");
  private static final UUID REVIEW_ID = UUID.fromString("00000000-0000-0000-0000-000000000555");
  private static final UUID SPEAKING_ID = UUID.fromString("00000000-0000-0000-0000-000000000666");
  private static final Instant NOW = Instant.parse("2026-09-08T05:00:00Z");

  private final StudySessionStore sessions = mock(StudySessionStore.class);
  private final ReviewSessions reviews = mock(ReviewSessions.class);
  private final SpeakingPractice speaking = mock(SpeakingPractice.class);
  private final LearnerProfiles profiles = mock(LearnerProfiles.class);
  private final IdempotencyExecutor idempotency = mock(IdempotencyExecutor.class);
  private final StudySessionService service =
      new StudySessionService(
          sessions,
          reviews,
          speaking,
          profiles,
          idempotency,
          new ObjectMapper(),
          Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  @SuppressWarnings("unchecked")
  void createsCombinedStudyAndLinksOwnedChildSessionsInOrder() {
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(profiles.get(USER_ID))
        .thenReturn(
            new LearnerProfileView(
                USER_ID, "Tuna", "en", "work", "B1", 10, "Asia/Bangkok", true, 1));
    when(reviews.start(eq(USER_ID), any(), eq(List.of(WORD_ID))))
        .thenReturn(new StartedReviewSession(reviewView(), false));
    when(speaking.start(eq(USER_ID), any(), eq(TOPIC_ID)))
        .thenReturn(new StartedSpeakingSession(speakingView(), false));
    when(reviews.get(USER_ID, REVIEW_ID)).thenReturn(reviewView());
    when(speaking.get(USER_ID, SPEAKING_ID)).thenReturn(speakingView());
    when(sessions.findOwned(any(), eq(USER_ID)))
        .thenAnswer(
            invocation ->
                Optional.of(
                    new StudySessionRecord(
                        invocation.getArgument(0),
                        USER_ID,
                        StudySessionStatus.IN_PROGRESS,
                        "Asia/Bangkok",
                        0,
                        0,
                        NOW,
                        null)));
    when(sessions.findSteps(any()))
        .thenAnswer(
            invocation ->
                List.of(
                    new StudyStepRecord(
                        UUID.randomUUID(),
                        invocation.getArgument(0),
                        0,
                        StudyStepKind.VOCABULARY,
                        REVIEW_ID,
                        null),
                    new StudyStepRecord(
                        UUID.randomUUID(),
                        invocation.getArgument(0),
                        1,
                        StudyStepKind.SPEAKING,
                        null,
                        SPEAKING_ID)));

    var started =
        service.start(
            USER_ID,
            REQUEST_KEY,
            List.of(
                new PlannedStudyStep("vocabulary", List.of(WORD_ID), null),
                new PlannedStudyStep("speaking", List.of(), TOPIC_ID)));

    assertThat(started.session().timezoneSnapshot()).isEqualTo("Asia/Bangkok");
    assertThat(started.session().steps())
        .extracting(step -> step.kind() + ":" + step.childStatus())
        .containsExactly("vocabulary:inProgress", "speaking:inProgress");
    verify(sessions).create(started.session().id(), USER_ID, "Asia/Bangkok", NOW);
    var steps = ArgumentCaptor.forClass(List.class);
    verify(sessions).addSteps(eq(started.session().id()), steps.capture(), eq(NOW));
    @SuppressWarnings("unchecked")
    List<NewStudyStep> created = (List<NewStudyStep>) steps.getValue();
    assertThat(created).hasSize(2);
    assertThat(created.get(0).reviewSessionId()).isEqualTo(REVIEW_ID);
    assertThat(created.get(1).speakingSessionId()).isEqualTo(SPEAKING_ID);
  }

  @Test
  void rejectsSpeakingBeforeVocabularyWithoutCreatingAnIdempotencyRecord() {
    var plan =
        List.of(
            new PlannedStudyStep("speaking", List.of(), TOPIC_ID),
            new PlannedStudyStep("vocabulary", List.of(WORD_ID), null));

    assertThatThrownBy(() -> service.start(USER_ID, REQUEST_KEY, plan))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("INVALID_STUDY_PLAN"));
    verify(idempotency, never()).execute(any(), any());
  }

  @Test
  void rejectsNullVocabularyWordIdAsAStableClientError() {
    List<UUID> invalidWordIds = new java.util.ArrayList<>();
    invalidWordIds.add(null);

    assertThatThrownBy(
            () ->
                service.start(
                    USER_ID,
                    REQUEST_KEY,
                    List.of(new PlannedStudyStep("vocabulary", invalidWordIds, null))))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("INVALID_STUDY_PLAN"));
    verify(idempotency, never()).execute(any(), any());
  }

  @Test
  @SuppressWarnings("unchecked")
  void refusesToAttachAnExistingIndependentChildSession() {
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(reviews.active(USER_ID)).thenReturn(Optional.of(reviewView()));

    assertThatThrownBy(
            () ->
                service.start(
                    USER_ID,
                    REQUEST_KEY,
                    List.of(new PlannedStudyStep("speaking", List.of(), TOPIC_ID))))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("ACTIVE_SESSION_EXISTS"));
    verify(sessions, never()).create(any(), any(), any(), any());
    verify(speaking, never()).start(any(), any(), any());
  }

  @Test
  void advancesExactlyOneStepAfterCurrentChildCompletes() {
    UUID sessionId = UUID.randomUUID();
    StudySessionRecord session =
        studySession(sessionId, StudySessionStatus.IN_PROGRESS, 0, 2, null);
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.findSteps(sessionId)).thenReturn(combinedSteps(sessionId));
    when(reviews.get(USER_ID, REVIEW_ID)).thenReturn(reviewView("completed", 3));
    when(speaking.get(USER_ID, SPEAKING_ID)).thenReturn(speakingView("inProgress", 0));
    when(sessions.advance(session, 1, NOW)).thenReturn(true);

    var advanced = service.advance(USER_ID, sessionId, 1, 2);

    assertThat(advanced.currentStep()).isEqualTo(1);
    assertThat(advanced.version()).isEqualTo(3);
    verify(sessions).advance(session, 1, NOW);
  }

  @Test
  void refusesToAdvanceWhileCurrentChildIsStillActive() {
    UUID sessionId = UUID.randomUUID();
    StudySessionRecord session =
        studySession(sessionId, StudySessionStatus.IN_PROGRESS, 0, 2, null);
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.findSteps(sessionId)).thenReturn(combinedSteps(sessionId));
    when(reviews.get(USER_ID, REVIEW_ID)).thenReturn(reviewView("inProgress", 3));
    when(speaking.get(USER_ID, SPEAKING_ID)).thenReturn(speakingView("inProgress", 0));

    assertThatThrownBy(() -> service.advance(USER_ID, sessionId, 1, 2))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("STUDY_CHILD_NOT_COMPLETED"));
    verify(sessions, never()).advance(any(), any(Integer.class), any());
  }

  @Test
  @SuppressWarnings("unchecked")
  void completesParentOnlyAfterEveryChildCompletes() {
    UUID sessionId = UUID.randomUUID();
    StudySessionRecord session =
        studySession(sessionId, StudySessionStatus.IN_PROGRESS, 1, 4, null);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.findSteps(sessionId)).thenReturn(combinedSteps(sessionId));
    when(reviews.get(USER_ID, REVIEW_ID)).thenReturn(reviewView("completed", 3));
    when(speaking.get(USER_ID, SPEAKING_ID)).thenReturn(speakingView("completed", 5));
    when(sessions.complete(session, NOW)).thenReturn(true);

    var completed = service.complete(USER_ID, REQUEST_KEY, sessionId, 4);

    assertThat(completed.session().status()).isEqualTo("completed");
    assertThat(completed.session().completedAt()).isEqualTo(NOW);
    assertThat(completed.session().version()).isEqualTo(5);
    verify(sessions).complete(session, NOW);
  }

  @Test
  @SuppressWarnings("unchecked")
  void abandonsOnlyChildrenThatRemainInProgress() {
    UUID sessionId = UUID.randomUUID();
    StudySessionRecord session =
        studySession(sessionId, StudySessionStatus.IN_PROGRESS, 1, 4, null);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.findSteps(sessionId)).thenReturn(combinedSteps(sessionId));
    when(reviews.get(USER_ID, REVIEW_ID)).thenReturn(reviewView("completed", 3));
    when(speaking.get(USER_ID, SPEAKING_ID)).thenReturn(speakingView("inProgress", 5));
    when(sessions.abandon(session, NOW)).thenReturn(true);

    service.abandon(USER_ID, REQUEST_KEY, sessionId, 4);

    verify(reviews, never()).abandon(any(), any(), any(), any(Long.class));
    verify(speaking).abandon(eq(USER_ID), any(), eq(SPEAKING_ID), eq(5L));
    verify(sessions).abandon(session, NOW);
  }

  private StudySessionRecord studySession(
      UUID sessionId,
      StudySessionStatus status,
      int currentStep,
      long version,
      Instant completedAt) {
    return new StudySessionRecord(
        sessionId,
        USER_ID,
        status,
        "Asia/Bangkok",
        currentStep,
        version,
        NOW.minusSeconds(600),
        completedAt);
  }

  private List<StudyStepRecord> combinedSteps(UUID sessionId) {
    return List.of(
        new StudyStepRecord(
            UUID.randomUUID(), sessionId, 0, StudyStepKind.VOCABULARY, REVIEW_ID, null),
        new StudyStepRecord(
            UUID.randomUUID(), sessionId, 1, StudyStepKind.SPEAKING, null, SPEAKING_ID));
  }

  private ReviewSessionView reviewView() {
    return reviewView("inProgress", 0);
  }

  private ReviewSessionView reviewView(String status, long version) {
    return new ReviewSessionView(
        REVIEW_ID,
        status,
        "Asia/Bangkok",
        "simple-v1",
        0,
        version,
        NOW,
        "completed".equals(status) ? NOW : null,
        List.of());
  }

  private SpeakingSessionView speakingView() {
    return speakingView("inProgress", 0);
  }

  private SpeakingSessionView speakingView(String status, long version) {
    return new SpeakingSessionView(
        SPEAKING_ID,
        status,
        "Asia/Bangkok",
        null,
        null,
        List.of(),
        version,
        NOW,
        "completed".equals(status) ? NOW : null);
  }
}
