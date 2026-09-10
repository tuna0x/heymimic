package com.dev.heymimic.progress.application;

import com.dev.heymimic.platform.application.publicapi.OutboxPublisher;
import com.dev.heymimic.platform.application.publicapi.PublishEvent;
import com.dev.heymimic.platform.application.publicapi.UserContextChanges;
import com.dev.heymimic.progress.application.port.MistakeOccurrenceRecord;
import com.dev.heymimic.progress.application.port.MistakePatternRecord;
import com.dev.heymimic.progress.application.port.MistakePatternStore;
import com.dev.heymimic.progress.application.publicapi.MistakeDetailView;
import com.dev.heymimic.progress.application.publicapi.MistakeOccurrencePageView;
import com.dev.heymimic.progress.application.publicapi.MistakeOccurrenceView;
import com.dev.heymimic.progress.application.publicapi.MistakePatternPageView;
import com.dev.heymimic.progress.application.publicapi.MistakePatternView;
import com.dev.heymimic.progress.application.publicapi.MistakeQueries;
import com.dev.heymimic.progress.domain.MistakeStatus;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MistakeQueryService implements MistakeQueries {
  private static final Set<String> CATEGORIES = Set.of("GRAMMAR", "VOCABULARY", "EXPRESSION");
  private final MistakePatternStore mistakes;
  private final Clock clock;
  private final OutboxPublisher outbox;
  private final UserContextChanges contextChanges;

  public MistakeQueryService(MistakePatternStore mistakes, Clock clock) {
    this(
        mistakes,
        clock,
        event -> event.aggregateId(),
        (userId, contextKey, causeEventId, requiredConsumers) -> 0L);
  }

  @org.springframework.beans.factory.annotation.Autowired
  public MistakeQueryService(
      MistakePatternStore mistakes,
      Clock clock,
      OutboxPublisher outbox,
      UserContextChanges contextChanges) {
    this.mistakes = mistakes;
    this.clock = clock;
    this.outbox = outbox;
    this.contextChanges = contextChanges;
  }

  @Override
  @Transactional(readOnly = true)
  public MistakePatternPageView find(
      UUID userId, String status, String category, int page, int size) {
    validatePage(page, size);
    var result = mistakes.find(userId, status(status), category(category), page, size);
    return new MistakePatternPageView(
        result.items().stream().map(this::view).toList(),
        page,
        size,
        result.totalItems(),
        result.totalPages());
  }

  @Override
  @Transactional(readOnly = true)
  public MistakeDetailView get(UUID userId, UUID patternId, int page, int size) {
    validatePage(page, size);
    var pattern = owned(userId, patternId);
    var occurrences = mistakes.findOccurrences(patternId, page, size);
    return new MistakeDetailView(
        view(pattern),
        new MistakeOccurrencePageView(
            occurrences.items().stream().map(this::view).toList(),
            page,
            size,
            occurrences.totalItems(),
            occurrences.totalPages()));
  }

  @Override
  @Transactional
  public MistakePatternView updateStatus(
      UUID userId, UUID patternId, String status, long expectedVersion) {
    var current = owned(userId, patternId);
    MistakeStatus target = requiredStatus(status);
    if (current.status() == target) return view(current);
    if (!mistakes.updateStatus(userId, patternId, target, expectedVersion, clock.instant())) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "MISTAKE_VERSION_CONFLICT",
          "Mistake pattern was updated by another request");
    }
    MistakePatternRecord updated = owned(userId, patternId);
    recordStatusChange(userId, updated, target);
    return view(updated);
  }

  private void recordStatusChange(UUID userId, MistakePatternRecord pattern, MistakeStatus status) {
    Instant occurredAt = clock.instant();
    UUID eventId =
        outbox.publish(
            new PublishEvent(
                userId,
                "MistakeStatusChanged",
                1,
                pattern.id(),
                occurredAt,
                "{\"userId\":\""
                    + userId
                    + "\",\"patternId\":\""
                    + pattern.id()
                    + "\",\"patternVersion\":"
                    + pattern.version()
                    + ",\"status\":\""
                    + status.name()
                    + "\"}"));
    contextChanges.record(
        userId, UserContextChanges.LEARNING_CONTEXT, eventId, java.util.List.of());
  }

  private MistakePatternRecord owned(UUID userId, UUID patternId) {
    return mistakes
        .findOwned(userId, patternId)
        .orElseThrow(
            () ->
                new ApiException(
                    HttpStatus.NOT_FOUND,
                    "MISTAKE_PATTERN_NOT_FOUND",
                    "Mistake pattern not found"));
  }

  private MistakeStatus status(String value) {
    if (value == null || value.isBlank()) return null;
    return requiredStatus(value);
  }

  private MistakeStatus requiredStatus(String value) {
    try {
      return MistakeStatus.valueOf(value.toUpperCase(Locale.ROOT));
    } catch (RuntimeException exception) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_MISTAKE_STATUS",
          "Mistake status must be active, resolved or ignored");
    }
  }

  private String category(String value) {
    if (value == null || value.isBlank()) return null;
    String normalized = value.toUpperCase(Locale.ROOT);
    if (!CATEGORIES.contains(normalized)) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_MISTAKE_CATEGORY",
          "Mistake category must be grammar, vocabulary or expression");
    }
    return normalized;
  }

  private void validatePage(int page, int size) {
    if (page < 0 || size < 1 || size > 100) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "INVALID_PAGE_REQUEST",
          "Page must be non-negative and size must be between 1 and 100");
    }
  }

  private MistakePatternView view(MistakePatternRecord pattern) {
    return new MistakePatternView(
        pattern.id(),
        pattern.category().toLowerCase(Locale.ROOT),
        pattern.patternKey(),
        pattern.taxonomyVersion(),
        pattern.title(),
        pattern.explanation(),
        pattern.status(),
        "notPracticed",
        pattern.occurrenceCount(),
        pattern.version(),
        pattern.firstSeenAt(),
        pattern.lastSeenAt());
  }

  private MistakeOccurrenceView view(MistakeOccurrenceRecord occurrence) {
    return new MistakeOccurrenceView(
        occurrence.id(),
        occurrence.evaluationId(),
        occurrence.originalText(),
        occurrence.suggestedText(),
        occurrence.occurredAt());
  }
}
