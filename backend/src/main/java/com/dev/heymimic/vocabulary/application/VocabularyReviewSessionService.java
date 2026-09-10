package com.dev.heymimic.vocabulary.application;

import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.OutboxPublisher;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.application.publicapi.UserContextChanges;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.ReviewEventRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewItemRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewSessionRecord;
import com.dev.heymimic.vocabulary.application.port.ReviewSessionStore;
import com.dev.heymimic.vocabulary.application.port.ReviewSummaryRecord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordRecord;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import com.dev.heymimic.vocabulary.application.publicapi.AbandonedReviewSession;
import com.dev.heymimic.vocabulary.application.publicapi.RatedReviewSession;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewCompletionView;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessionItemView;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessionView;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessionWordView;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessions;
import com.dev.heymimic.vocabulary.application.publicapi.StartedReviewSession;
import com.dev.heymimic.vocabulary.application.publicapi.UndoneReviewRating;
import com.dev.heymimic.vocabulary.domain.ReviewRating;
import com.dev.heymimic.vocabulary.domain.ReviewWordState;
import com.dev.heymimic.vocabulary.domain.SimpleReviewScheduler;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
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
public class VocabularyReviewSessionService implements ReviewSessions {
  private static final int MAX_WORDS = 50;
  private static final int DEFAULT_WORDS = 20;
  private static final String SCHEDULER_VERSION = "simple-v1";
  private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(1);
  private final ReviewSessionStore sessions;
  private final VocabularyWordStore words;
  private final LearnerProfiles profiles;
  private final IdempotencyExecutor idempotency;
  private final OutboxPublisher outbox;
  private final ObjectMapper objectMapper;
  private final Clock clock;
  private final UserContextChanges contextChanges;

  public VocabularyReviewSessionService(
      ReviewSessionStore sessions,
      VocabularyWordStore words,
      LearnerProfiles profiles,
      IdempotencyExecutor idempotency,
      OutboxPublisher outbox,
      ObjectMapper objectMapper,
      Clock clock) {
    this(
        sessions,
        words,
        profiles,
        idempotency,
        outbox,
        objectMapper,
        clock,
        (userId, key, eventId, consumers) -> 0L);
  }

  @org.springframework.beans.factory.annotation.Autowired
  public VocabularyReviewSessionService(
      ReviewSessionStore sessions,
      VocabularyWordStore words,
      LearnerProfiles profiles,
      IdempotencyExecutor idempotency,
      OutboxPublisher outbox,
      ObjectMapper objectMapper,
      Clock clock,
      UserContextChanges contextChanges) {
    this.sessions = sessions;
    this.words = words;
    this.profiles = profiles;
    this.idempotency = idempotency;
    this.outbox = outbox;
    this.objectMapper = objectMapper;
    this.clock = clock;
    this.contextChanges = contextChanges;
  }

  @Override
  public StartedReviewSession start(UUID userId, UUID idempotencyKey, List<UUID> requestedWordIds) {
    List<UUID> wordIds = requestedWordIds == null ? List.of() : List.copyOf(requestedWordIds);
    validateWordIds(wordIds);
    String canonicalRequest =
        wordIds.isEmpty()
            ? "auto"
            : wordIds.stream()
                .map(UUID::toString)
                .collect(java.util.stream.Collectors.joining(","));
    var command =
        new IdempotencyCommand(
            userId,
            "vocabulary.review-session.create",
            idempotencyKey,
            canonicalRequest,
            IDEMPOTENCY_TTL);
    IdempotentResponse result = idempotency.execute(command, () -> startFresh(userId, wordIds));
    return new StartedReviewSession(
        read(result.bodyJson(), ReviewSessionView.class), result.replayed());
  }

  private IdempotentResponse startFresh(UUID userId, List<UUID> requestedWordIds) {
    if (sessions.findActive(userId).isPresent()) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "ACTIVE_REVIEW_SESSION_EXISTS",
          "An active vocabulary review session already exists");
    }
    Instant now = clock.instant();
    List<VocabularyWordRecord> selected = selectWords(userId, requestedWordIds, now);
    if (selected.isEmpty()) {
      throw new ApiException(
          HttpStatus.UNPROCESSABLE_CONTENT,
          "NO_VOCABULARY_WORDS_DUE",
          "No vocabulary words are available for review");
    }
    UUID sessionId = UUID.randomUUID();
    sessions.create(
        sessionId,
        userId,
        profiles.get(userId).timezone(),
        SCHEDULER_VERSION,
        selected.stream().map(VocabularyWordRecord::id).toList(),
        now);
    if (!words.assignReviewLock(
        userId, selected.stream().map(VocabularyWordRecord::id).toList(), sessionId)) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "VOCABULARY_WORD_ALREADY_IN_REVIEW",
          "One or more vocabulary words are already in another review session");
    }
    ReviewSessionRecord session = sessions.findOwned(sessionId, userId).orElseThrow();
    ReviewSessionView view = view(session, sessions.findItems(sessionId), selected);
    return IdempotentResponse.fresh(HttpStatus.CREATED.value(), write(view));
  }

  private List<VocabularyWordRecord> selectWords(UUID userId, List<UUID> requested, Instant now) {
    if (requested.isEmpty()) return words.lockDueForReview(userId, now, DEFAULT_WORDS);
    var found = words.lockOwnedForReview(userId, requested);
    if (found.size() != requested.size()) {
      throw new ApiException(
          HttpStatus.NOT_FOUND,
          "VOCABULARY_WORD_NOT_FOUND",
          "One or more vocabulary words were not found");
    }
    if (found.stream().anyMatch(word -> word.reviewLockSessionId() != null)) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "VOCABULARY_WORD_ALREADY_IN_REVIEW",
          "One or more vocabulary words are already in another review session");
    }
    var byId = new HashMap<UUID, VocabularyWordRecord>();
    found.forEach(word -> byId.put(word.id(), word));
    return requested.stream().map(byId::get).toList();
  }

  @Override
  @Transactional(readOnly = true)
  public ReviewSessionView get(UUID userId, UUID sessionId) {
    ReviewSessionRecord session =
        sessions
            .findOwned(sessionId, userId)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "REVIEW_SESSION_NOT_FOUND",
                        "Vocabulary review session not found"));
    List<ReviewItemRecord> items = sessions.findItems(session.id());
    return view(session, items, loadWords(userId, items));
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<ReviewSessionView> active(UUID userId) {
    return sessions
        .findActive(userId)
        .map(
            session -> {
              List<ReviewItemRecord> items = sessions.findItems(session.id());
              return view(session, items, loadWords(userId, items));
            });
  }

  @Override
  public RatedReviewSession rate(
      UUID userId,
      UUID idempotencyKey,
      UUID sessionId,
      UUID wordId,
      String ratingValue,
      long expectedVersion) {
    ReviewRating rating = parseRating(ratingValue);
    String canonicalRequest =
        sessionId + ":" + wordId + ":" + rating.name() + ":" + expectedVersion;
    var command =
        new IdempotencyCommand(
            userId,
            "vocabulary.review-session.rate",
            idempotencyKey,
            canonicalRequest,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(
            command, () -> rateFresh(userId, sessionId, wordId, rating, expectedVersion));
    RatingPayload payload = read(result.bodyJson(), RatingPayload.class);
    return new RatedReviewSession(payload.eventId(), payload.session(), result.replayed());
  }

  private IdempotentResponse rateFresh(
      UUID userId, UUID sessionId, UUID wordId, ReviewRating rating, long expectedVersion) {
    ReviewSessionRecord session = lockInProgress(userId, sessionId, expectedVersion);
    List<ReviewItemRecord> items = sessions.findItems(sessionId);
    if (session.currentIndex() >= items.size()) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "REVIEW_SESSION_AWAITING_COMPLETION",
          "Every word in this review session has already been rated");
    }
    ReviewItemRecord item = items.get(session.currentIndex());
    if (!item.wordId().equals(wordId)) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "REVIEW_WORD_OUT_OF_ORDER",
          "Only the current review word can be rated");
    }
    if (item.activeEventId() != null) {
      throw reviewConflict();
    }
    VocabularyWordRecord word =
        words
            .findOwned(wordId, userId)
            .filter(found -> sessionId.equals(found.reviewLockSessionId()))
            .orElseThrow(reviewConflictSupplier());
    Instant now = clock.instant();
    ReviewWordState before =
        ReviewWordState.from(
            word.mastery(), word.status(), word.intervalDays(), word.nextReviewAt());
    ReviewWordState after = SimpleReviewScheduler.rate(before, rating, now);
    if (!words.applyReviewState(word.id(), userId, sessionId, word.version(), after, now)) {
      throw reviewConflict();
    }
    UUID eventId = UUID.randomUUID();
    int durationSeconds = estimatedDuration(item.presentedAt(), now);
    UUID nextItemId =
        session.currentIndex() + 1 < items.size()
            ? items.get(session.currentIndex() + 1).id()
            : null;
    if (!sessions.recordRating(
        eventId,
        session,
        item,
        rating,
        write(before),
        write(after),
        durationSeconds,
        nextItemId,
        now)) {
      throw reviewConflict();
    }
    ReviewSessionView updated = get(userId, sessionId);
    recordRatingChange(userId, sessionId, eventId, wordId, rating, now);
    return IdempotentResponse.fresh(
        HttpStatus.OK.value(), write(new RatingPayload(eventId, updated)));
  }

  @Override
  public UndoneReviewRating undo(
      UUID userId, UUID idempotencyKey, UUID sessionId, UUID eventId, long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "vocabulary.review-session.undo",
            idempotencyKey,
            sessionId + ":" + eventId + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> undoFresh(userId, sessionId, eventId, expectedVersion));
    return new UndoneReviewRating(result.replayed());
  }

  private IdempotentResponse undoFresh(
      UUID userId, UUID sessionId, UUID eventId, long expectedVersion) {
    ReviewSessionRecord session = lockInProgress(userId, sessionId, expectedVersion);
    if (session.currentIndex() == 0) throw undoConflict();
    List<ReviewItemRecord> items = sessions.findItems(sessionId);
    int previousIndex = session.currentIndex() - 1;
    if (previousIndex >= items.size()) throw undoConflict();
    ReviewItemRecord item = items.get(previousIndex);
    if (!eventId.equals(item.activeEventId())) throw undoConflict();
    ReviewEventRecord event =
        sessions
            .findEvent(eventId, sessionId)
            .filter(found -> found.undoneAt() == null)
            .filter(found -> found.itemId().equals(item.id()))
            .filter(found -> found.wordId().equals(item.wordId()))
            .orElseThrow(this::undoConflict);
    VocabularyWordRecord word =
        words
            .findOwned(item.wordId(), userId)
            .filter(found -> sessionId.equals(found.reviewLockSessionId()))
            .orElseThrow(this::undoConflict);
    ReviewWordState before = read(event.beforeStateJson(), ReviewWordState.class);
    Instant now = clock.instant();
    if (!words.applyReviewState(word.id(), userId, sessionId, word.version(), before, now)) {
      throw undoConflict();
    }
    if (!sessions.undoRating(session, item, event, now)) throw undoConflict();
    UUID undoEventId =
        outbox.publish(
            new PublishEvent(
                userId,
                "VocabularyReviewRatingUndone",
                1,
                sessionId,
                now,
                "{\"userId\":\""
                    + userId
                    + "\",\"sessionId\":\""
                    + sessionId
                    + "\",\"originalReviewEventId\":\""
                    + eventId
                    + "\"}"));
    contextChanges.record(
        userId, UserContextChanges.LEARNING_CONTEXT, undoEventId, java.util.List.of());
    return IdempotentResponse.fresh(HttpStatus.NO_CONTENT.value(), "{}");
  }

  private void recordRatingChange(
      UUID userId,
      UUID sessionId,
      UUID eventId,
      UUID wordId,
      ReviewRating rating,
      Instant occurredAt) {
    UUID changeEventId =
        outbox.publish(
            new PublishEvent(
                userId,
                "VocabularyReviewRatingRecorded",
                1,
                sessionId,
                occurredAt,
                "{\"userId\":\""
                    + userId
                    + "\",\"sessionId\":\""
                    + sessionId
                    + "\",\"reviewEventId\":\""
                    + eventId
                    + "\",\"wordId\":\""
                    + wordId
                    + "\",\"rating\":\""
                    + rating.name()
                    + "\"}"));
    contextChanges.record(
        userId, UserContextChanges.LEARNING_CONTEXT, changeEventId, java.util.List.of());
  }

  @Override
  public ReviewCompletionView complete(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "vocabulary.review-session.complete",
            idempotencyKey,
            sessionId + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> completeFresh(userId, sessionId, expectedVersion));
    CompletionPayload payload = read(result.bodyJson(), CompletionPayload.class);
    return new ReviewCompletionView(
        payload.sessionId(),
        payload.totalWords(),
        payload.rememberedWords(),
        payload.needsReviewWords(),
        payload.acceptedDurationSeconds(),
        payload.completedAt(),
        result.replayed());
  }

  private IdempotentResponse completeFresh(UUID userId, UUID sessionId, long expectedVersion) {
    ReviewSessionRecord session = loadLocked(userId, sessionId);
    ReviewSummaryRecord summary = sessions.summarize(sessionId);
    if (session.status() == com.dev.heymimic.vocabulary.domain.ReviewSessionStatus.COMPLETED) {
      return IdempotentResponse.fresh(
          HttpStatus.OK.value(), write(completionPayload(session, summary)));
    }
    if (session.status() != com.dev.heymimic.vocabulary.domain.ReviewSessionStatus.IN_PROGRESS
        || session.version() != expectedVersion) {
      throw reviewConflict();
    }
    List<ReviewItemRecord> items = sessions.findItems(sessionId);
    if (session.currentIndex() != items.size() || summary.totalWords() != items.size()) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "REVIEW_SESSION_NOT_READY",
          "Every review word must have an active rating before completion");
    }
    Instant now = clock.instant();
    if (!sessions.complete(session, now)) throw reviewConflict();
    releaseAllLocks(userId, sessionId, items.size());
    CompletionPayload payload =
        new CompletionPayload(
            sessionId,
            summary.totalWords(),
            summary.rememberedWords(),
            summary.needsReviewWords(),
            summary.acceptedDurationSeconds(),
            now);
    UUID eventId =
        outbox.publish(
            new PublishEvent(
                userId,
                "VocabularyReviewCompleted",
                1,
                sessionId,
                now,
                write(
                    new ReviewCompletedEventPayload(
                        sessionId,
                        userId,
                        now,
                        session.timezone(),
                        summary.acceptedDurationSeconds(),
                        session.schedulerVersion()))));
    contextChanges.record(
        userId,
        UserContextChanges.LEARNING_CONTEXT,
        eventId,
        java.util.List.of("progress-activity-ledger-v1"));
    return IdempotentResponse.fresh(HttpStatus.OK.value(), write(payload));
  }

  @Override
  public AbandonedReviewSession abandon(
      UUID userId, UUID idempotencyKey, UUID sessionId, long expectedVersion) {
    var command =
        new IdempotencyCommand(
            userId,
            "vocabulary.review-session.abandon",
            idempotencyKey,
            sessionId + ":" + expectedVersion,
            IDEMPOTENCY_TTL);
    IdempotentResponse result =
        idempotency.execute(command, () -> abandonFresh(userId, sessionId, expectedVersion));
    return new AbandonedReviewSession(result.replayed());
  }

  private IdempotentResponse abandonFresh(UUID userId, UUID sessionId, long expectedVersion) {
    ReviewSessionRecord session = loadLocked(userId, sessionId);
    if (session.status() == com.dev.heymimic.vocabulary.domain.ReviewSessionStatus.ABANDONED) {
      return IdempotentResponse.fresh(HttpStatus.NO_CONTENT.value(), "{}");
    }
    if (session.status() != com.dev.heymimic.vocabulary.domain.ReviewSessionStatus.IN_PROGRESS
        || session.version() != expectedVersion) {
      throw reviewConflict();
    }
    int itemCount = sessions.findItems(sessionId).size();
    if (!sessions.abandon(session, clock.instant())) throw reviewConflict();
    releaseAllLocks(userId, sessionId, itemCount);
    return IdempotentResponse.fresh(HttpStatus.NO_CONTENT.value(), "{}");
  }

  private ReviewSessionRecord loadLocked(UUID userId, UUID sessionId) {
    return sessions
        .lockOwned(sessionId, userId)
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND,
                    "REVIEW_SESSION_NOT_FOUND",
                    "Vocabulary review session not found"));
  }

  private void releaseAllLocks(UUID userId, UUID sessionId, int expectedCount) {
    if (words.releaseReviewLocks(userId, sessionId) != expectedCount) {
      throw new IllegalStateException("Review session word locks are inconsistent");
    }
  }

  private CompletionPayload completionPayload(
      ReviewSessionRecord session, ReviewSummaryRecord summary) {
    return new CompletionPayload(
        session.id(),
        summary.totalWords(),
        summary.rememberedWords(),
        summary.needsReviewWords(),
        summary.acceptedDurationSeconds(),
        session.completedAt());
  }

  private ApiException undoConflict() {
    return new ApiException(
        HttpStatus.CONFLICT,
        "REVIEW_UNDO_NOT_ALLOWED",
        "Only the latest active rating can be undone while the session is in progress");
  }

  private ReviewSessionRecord lockInProgress(UUID userId, UUID sessionId, long expectedVersion) {
    ReviewSessionRecord session =
        sessions
            .lockOwned(sessionId, userId)
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "REVIEW_SESSION_NOT_FOUND",
                        "Vocabulary review session not found"));
    if (session.status() != com.dev.heymimic.vocabulary.domain.ReviewSessionStatus.IN_PROGRESS
        || session.version() != expectedVersion) {
      throw reviewConflict();
    }
    return session;
  }

  private ReviewRating parseRating(String value) {
    try {
      return ReviewRating.fromApi(value);
    } catch (IllegalArgumentException exception) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_REVIEW_RATING",
          "Rating must be remembered or needsReview");
    }
  }

  private int estimatedDuration(Instant presentedAt, Instant now) {
    if (presentedAt == null || presentedAt.isAfter(now)) return 0;
    return (int) Math.min(120, Duration.between(presentedAt, now).toSeconds());
  }

  private ApiException reviewConflict() {
    return new ApiException(
        HttpStatus.CONFLICT,
        "REVIEW_SESSION_STATE_CONFLICT",
        "The review session changed; reload its latest state");
  }

  private java.util.function.Supplier<ApiException> reviewConflictSupplier() {
    return this::reviewConflict;
  }

  private List<VocabularyWordRecord> loadWords(UUID userId, List<ReviewItemRecord> items) {
    var byId = new HashMap<UUID, VocabularyWordRecord>();
    words
        .findOwnedByIds(userId, items.stream().map(ReviewItemRecord::wordId).toList())
        .forEach(word -> byId.put(word.id(), word));
    if (byId.size() != items.size())
      throw new IllegalStateException("Review session contains a missing word");
    return items.stream().map(item -> byId.get(item.wordId())).toList();
  }

  private ReviewSessionView view(
      ReviewSessionRecord session,
      List<ReviewItemRecord> items,
      List<VocabularyWordRecord> orderedWords) {
    if (items.size() != orderedWords.size())
      throw new IllegalStateException("Review session snapshot is inconsistent");
    var views =
        java.util.stream.IntStream.range(0, items.size())
            .mapToObj(
                index ->
                    new ReviewSessionItemView(
                        items.get(index).id(),
                        items.get(index).position(),
                        wordView(orderedWords.get(index)),
                        items.get(index).activeEventId()))
            .toList();
    return new ReviewSessionView(
        session.id(),
        session.status().apiValue(),
        session.timezone(),
        session.schedulerVersion(),
        session.currentIndex(),
        session.version(),
        session.startedAt(),
        session.completedAt(),
        views);
  }

  private ReviewSessionWordView wordView(VocabularyWordRecord word) {
    return new ReviewSessionWordView(
        word.id(),
        word.word(),
        word.meaning(),
        word.pronunciation(),
        word.partOfSpeech(),
        word.example(),
        word.translation(),
        word.sourceContext(),
        word.mastery(),
        word.status().apiValue(),
        word.intervalDays(),
        word.nextReviewAt(),
        word.version());
  }

  private void validateWordIds(List<UUID> wordIds) {
    if (wordIds.stream().anyMatch(java.util.Objects::isNull))
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_REVIEW_WORD_ID",
          "Review word IDs must not contain null");
    if (wordIds.size() > MAX_WORDS)
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "TOO_MANY_REVIEW_WORDS",
          "A review session can contain at most 50 words");
    if (new HashSet<>(wordIds).size() != wordIds.size())
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "DUPLICATE_REVIEW_WORD_IDS", "Review word IDs must be unique");
  }

  private String write(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not serialize review session", exception);
    }
  }

  private <T> T read(String value, Class<T> type) {
    try {
      return objectMapper.readValue(value, type);
    } catch (JacksonException exception) {
      throw new IllegalStateException("Could not deserialize review session", exception);
    }
  }

  private record RatingPayload(UUID eventId, ReviewSessionView session) {}

  private record CompletionPayload(
      UUID sessionId,
      int totalWords,
      int rememberedWords,
      int needsReviewWords,
      int acceptedDurationSeconds,
      Instant completedAt) {}

  private record ReviewCompletedEventPayload(
      UUID sessionId,
      UUID userId,
      Instant completedAt,
      String timezoneSnapshot,
      int acceptedDurationSeconds,
      String ruleVersion) {}
}
