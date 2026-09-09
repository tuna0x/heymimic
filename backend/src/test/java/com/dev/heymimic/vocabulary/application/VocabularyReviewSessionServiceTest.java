package com.dev.heymimic.vocabulary.application;

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
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.OutboxPublisher;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.ReviewEventRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewItemRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewSessionRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewSessionStore;
import com.dev.heymimic.vocabulary.application.port.ReviewSummaryRecord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordRecord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import com.dev.heymimic.vocabulary.domain.ReviewRating;
import com.dev.heymimic.vocabulary.domain.ReviewSessionStatus;
import com.dev.heymimic.vocabulary.domain.ReviewWordState;
import com.dev.heymimic.vocabulary.domain.VocabularyStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class VocabularyReviewSessionServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
  private static final UUID IDEMPOTENCY_KEY =
      UUID.fromString("00000000-0000-0000-0000-000000000222");
  private static final Instant NOW = Instant.parse("2026-09-07T12:00:00Z");
  private final ReviewSessionStore sessions = mock(ReviewSessionStore.class);
  private final VocabularyWordStore words = mock(VocabularyWordStore.class);
  private final LearnerProfiles profiles = mock(LearnerProfiles.class);
  private final IdempotencyExecutor idempotency = mock(IdempotencyExecutor.class);
  private final OutboxPublisher outbox = mock(OutboxPublisher.class);
  private final VocabularyReviewSessionService service =
      new VocabularyReviewSessionService(
          sessions,
          words,
          profiles,
          idempotency,
          outbox,
          new ObjectMapper(),
          Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  @SuppressWarnings("unchecked")
  void createsIdempotentSessionAndPreservesRequestedWordOrder() {
    VocabularyWordRecord second = word(UUID.randomUUID(), "second");
    VocabularyWordRecord first = word(UUID.randomUUID(), "first");
    List<UUID> requested = List.of(first.id(), second.id());
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(words.lockOwnedForReview(USER_ID, requested)).thenReturn(List.of(second, first));
    when(words.assignReviewLock(eq(USER_ID), eq(requested), any())).thenReturn(true);
    when(profiles.get(USER_ID))
        .thenReturn(
            new LearnerProfileView(
                USER_ID, "Tuna", "en", "travel", "a2", 10, "Asia/Bangkok", true, 1));
    when(sessions.findOwned(any(), eq(USER_ID)))
        .thenAnswer(
            invocation ->
                Optional.of(
                    new ReviewSessionRecord(
                        invocation.getArgument(0, UUID.class),
                        USER_ID,
                        ReviewSessionStatus.IN_PROGRESS,
                        "Asia/Bangkok",
                        "simple-v1",
                        0,
                        0,
                        NOW,
                        null,
                        NOW)));
    when(sessions.findItems(any()))
        .thenAnswer(
            invocation ->
                List.of(
                    new ReviewItemRecord(
                        UUID.randomUUID(),
                        invocation.getArgument(0, UUID.class),
                        first.id(),
                        0,
                        null,
                        NOW),
                    new ReviewItemRecord(
                        UUID.randomUUID(),
                        invocation.getArgument(0, UUID.class),
                        second.id(),
                        1,
                        null,
                        null)));

    var started = service.start(USER_ID, IDEMPOTENCY_KEY, requested);

    assertThat(started.session().items())
        .extracting(item -> item.word().id())
        .containsExactly(first.id(), second.id());
    verify(idempotency)
        .execute(
            eq(
                new IdempotencyCommand(
                    USER_ID,
                    "vocabulary.review-session.create",
                    IDEMPOTENCY_KEY,
                    first.id() + "," + second.id(),
                    Duration.ofDays(1))),
            any());
    verify(sessions)
        .create(
            eq(started.session().id()),
            eq(USER_ID),
            eq("Asia/Bangkok"),
            eq("simple-v1"),
            eq(requested),
            eq(NOW));
    verify(words).assignReviewLock(USER_ID, requested, started.session().id());
  }

  @Test
  void getDoesNotRevealAnotherOwnersSession() {
    UUID sessionId = UUID.randomUUID();
    when(sessions.findOwned(sessionId, USER_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.get(USER_ID, sessionId))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("REVIEW_SESSION_NOT_FOUND"));
  }

  @Test
  @SuppressWarnings("unchecked")
  void ratingUpdatesWordEventAndCursorInsideIdempotentOperation() {
    UUID sessionId = UUID.randomUUID();
    VocabularyWordRecord base = word(UUID.randomUUID(), "steady");
    VocabularyWordRecord locked =
        new VocabularyWordRecord(
            base.id(),
            base.userId(),
            base.targetLanguage(),
            base.normalizedWord(),
            base.senseKey(),
            base.word(),
            base.meaning(),
            base.pronunciation(),
            base.partOfSpeech(),
            base.example(),
            base.translation(),
            base.sourceContext(),
            base.mastery(),
            base.status(),
            base.intervalDays(),
            base.nextReviewAt(),
            sessionId,
            base.version(),
            base.createdAt());
    var session =
        new ReviewSessionRecord(
            sessionId,
            USER_ID,
            ReviewSessionStatus.IN_PROGRESS,
            "Asia/Bangkok",
            "simple-v1",
            0,
            0,
            NOW.minusSeconds(30),
            null,
            NOW.minusSeconds(30));
    var item =
        new ReviewItemRecord(
            UUID.randomUUID(), sessionId, locked.id(), 0, null, NOW.minusSeconds(30));
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.findItems(sessionId)).thenReturn(List.of(item));
    when(words.findOwned(locked.id(), USER_ID)).thenReturn(Optional.of(locked));
    when(words.applyReviewState(any(), any(), any(), eq(0L), any(), eq(NOW))).thenReturn(true);
    when(sessions.recordRating(
            any(),
            eq(session),
            eq(item),
            eq(ReviewRating.REMEMBERED),
            any(),
            any(),
            eq(30),
            eq(null),
            eq(NOW)))
        .thenReturn(true);
    when(sessions.findOwned(sessionId, USER_ID))
        .thenReturn(
            Optional.of(
                new ReviewSessionRecord(
                    sessionId,
                    USER_ID,
                    ReviewSessionStatus.IN_PROGRESS,
                    "Asia/Bangkok",
                    "simple-v1",
                    1,
                    1,
                    session.startedAt(),
                    null,
                    NOW)));
    when(words.findOwnedByIds(USER_ID, List.of(locked.id()))).thenReturn(List.of(locked));

    var rated = service.rate(USER_ID, IDEMPOTENCY_KEY, sessionId, locked.id(), "remembered", 0);

    assertThat(rated.eventId()).isNotNull();
    assertThat(rated.session().currentIndex()).isEqualTo(1);
    verify(words)
        .applyReviewState(
            locked.id(),
            USER_ID,
            sessionId,
            0,
            ReviewWordState.from(12, VocabularyStatus.REVIEWING, 1, NOW.plus(Duration.ofDays(1))),
            NOW);
    verify(sessions)
        .recordRating(
            eq(rated.eventId()),
            eq(session),
            eq(item),
            eq(ReviewRating.REMEMBERED),
            any(),
            any(),
            eq(30),
            eq(null),
            eq(NOW));
  }

  @Test
  @SuppressWarnings("unchecked")
  void undoRestoresBeforeStateAndRewindsLatestActiveRating() throws Exception {
    UUID sessionId = UUID.randomUUID();
    UUID eventId = UUID.randomUUID();
    VocabularyWordRecord base = word(UUID.randomUUID(), "steady");
    VocabularyWordRecord rated =
        new VocabularyWordRecord(
            base.id(),
            base.userId(),
            base.targetLanguage(),
            base.normalizedWord(),
            base.senseKey(),
            base.word(),
            base.meaning(),
            base.pronunciation(),
            base.partOfSpeech(),
            base.example(),
            base.translation(),
            base.sourceContext(),
            12,
            VocabularyStatus.REVIEWING,
            1,
            NOW.plus(Duration.ofDays(1)),
            sessionId,
            1,
            base.createdAt());
    var session =
        new ReviewSessionRecord(
            sessionId,
            USER_ID,
            ReviewSessionStatus.IN_PROGRESS,
            "Asia/Bangkok",
            "simple-v1",
            1,
            1,
            NOW.minusSeconds(60),
            null,
            NOW.minusSeconds(30));
    var item =
        new ReviewItemRecord(
            UUID.randomUUID(), sessionId, rated.id(), 0, eventId, NOW.minusSeconds(30));
    ReviewWordState before = ReviewWordState.from(0, VocabularyStatus.NEW, 0, NOW);
    var event =
        new ReviewEventRecord(
            eventId,
            sessionId,
            item.id(),
            rated.id(),
            ReviewRating.REMEMBERED,
            new ObjectMapper().writeValueAsString(before),
            "{}",
            30,
            NOW.minusSeconds(1),
            null);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.findItems(sessionId)).thenReturn(List.of(item));
    when(sessions.findEvent(eventId, sessionId)).thenReturn(Optional.of(event));
    when(words.findOwned(rated.id(), USER_ID)).thenReturn(Optional.of(rated));
    when(words.applyReviewState(rated.id(), USER_ID, sessionId, 1, before, NOW)).thenReturn(true);
    when(sessions.undoRating(session, item, event, NOW)).thenReturn(true);

    var result = service.undo(USER_ID, IDEMPOTENCY_KEY, sessionId, eventId, 1);

    assertThat(result.replayed()).isFalse();
    verify(words).applyReviewState(rated.id(), USER_ID, sessionId, 1, before, NOW);
    verify(sessions).undoRating(session, item, event, NOW);
  }

  @Test
  @SuppressWarnings("unchecked")
  void completePublishesSummaryAndReleasesEveryWordLock() {
    UUID sessionId = UUID.randomUUID();
    UUID firstWordId = UUID.randomUUID();
    UUID secondWordId = UUID.randomUUID();
    var session =
        new ReviewSessionRecord(
            sessionId,
            USER_ID,
            ReviewSessionStatus.IN_PROGRESS,
            "Asia/Bangkok",
            "simple-v1",
            2,
            2,
            NOW.minusSeconds(90),
            null,
            NOW.minusSeconds(10));
    var items =
        List.of(
            new ReviewItemRecord(
                UUID.randomUUID(),
                sessionId,
                firstWordId,
                0,
                UUID.randomUUID(),
                NOW.minusSeconds(90)),
            new ReviewItemRecord(
                UUID.randomUUID(),
                sessionId,
                secondWordId,
                1,
                UUID.randomUUID(),
                NOW.minusSeconds(40)));
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.summarize(sessionId)).thenReturn(new ReviewSummaryRecord(2, 1, 1, 60));
    when(sessions.findItems(sessionId)).thenReturn(items);
    when(sessions.complete(session, NOW)).thenReturn(true);
    when(words.releaseReviewLocks(USER_ID, sessionId)).thenReturn(2);

    var completed = service.complete(USER_ID, IDEMPOTENCY_KEY, sessionId, 2);

    assertThat(completed.sessionId()).isEqualTo(sessionId);
    assertThat(completed.totalWords()).isEqualTo(2);
    assertThat(completed.rememberedWords()).isEqualTo(1);
    assertThat(completed.needsReviewWords()).isEqualTo(1);
    assertThat(completed.acceptedDurationSeconds()).isEqualTo(60);
    assertThat(completed.completedAt()).isEqualTo(NOW);
    assertThat(completed.replayed()).isFalse();
    verify(sessions).complete(session, NOW);
    verify(words).releaseReviewLocks(USER_ID, sessionId);
    verify(outbox)
        .publish(
            org.mockito.ArgumentMatchers.argThat(
                (PublishEvent event) ->
                    event.ownerUserId().equals(USER_ID)
                        && event.eventType().equals("VocabularyReviewCompleted")
                        && event.schemaVersion() == 1
                        && event.aggregateId().equals(sessionId)
                        && event.occurredAt().equals(NOW)
                        && event.payloadJson().contains("acceptedDurationSeconds")
                        && event.payloadJson().contains("60")));
  }

  @Test
  @SuppressWarnings("unchecked")
  void abandonRetainsRatingsWithoutPublishingCompletionAndReleasesLocks() {
    UUID sessionId = UUID.randomUUID();
    var session =
        new ReviewSessionRecord(
            sessionId,
            USER_ID,
            ReviewSessionStatus.IN_PROGRESS,
            "Asia/Bangkok",
            "simple-v1",
            1,
            1,
            NOW.minusSeconds(90),
            null,
            NOW.minusSeconds(10));
    var items =
        List.of(
            new ReviewItemRecord(
                UUID.randomUUID(), sessionId, UUID.randomUUID(), 0, UUID.randomUUID(), NOW),
            new ReviewItemRecord(UUID.randomUUID(), sessionId, UUID.randomUUID(), 1, null, null));
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());
    when(sessions.lockOwned(sessionId, USER_ID)).thenReturn(Optional.of(session));
    when(sessions.findItems(sessionId)).thenReturn(items);
    when(sessions.abandon(session, NOW)).thenReturn(true);
    when(words.releaseReviewLocks(USER_ID, sessionId)).thenReturn(2);

    var abandoned = service.abandon(USER_ID, IDEMPOTENCY_KEY, sessionId, 1);

    assertThat(abandoned.replayed()).isFalse();
    verify(sessions).abandon(session, NOW);
    verify(words).releaseReviewLocks(USER_ID, sessionId);
    verify(outbox, never()).publish(any());
  }

  private VocabularyWordRecord word(UUID id, String value) {
    return new VocabularyWordRecord(
        id,
        USER_ID,
        "en",
        value,
        value,
        value,
        "meaning",
        null,
        null,
        null,
        null,
        null,
        0,
        VocabularyStatus.NEW,
        0,
        NOW,
        null,
        0,
        NOW);
  }
}
