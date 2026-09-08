package com.dev.heymimic.progress.application;

import com.dev.heymimic.platform.application.publicapi.EventConsumer;
import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import com.dev.heymimic.progress.application.port.MistakeFeedbackItem;
import com.dev.heymimic.progress.application.port.MistakePatternStore;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class SpeakingEvaluationCompletedConsumer implements EventConsumer {
  static final String EVENT_TYPE = "SpeakingEvaluationCompleted";
  static final String CONSUMER_NAME = "progress-mistake-projection-v1";
  private static final Set<String> CATEGORIES = Set.of("GRAMMAR", "VOCABULARY", "EXPRESSION");
  private final MistakePatternStore mistakes;
  private final ObjectMapper objectMapper;

  public SpeakingEvaluationCompletedConsumer(
      MistakePatternStore mistakes, ObjectMapper objectMapper) {
    this.mistakes = mistakes;
    this.objectMapper = objectMapper;
  }

  @Override
  public String consumerName() {
    return CONSUMER_NAME;
  }

  @Override
  public String eventType() {
    return EVENT_TYPE;
  }

  @Override
  @Transactional
  public void consume(PublishedEvent event) {
    Payload payload = read(event.payloadJson());
    validate(event, payload);
    mistakes.record(
        payload.userId(),
        payload.evaluationId(),
        payload.taxonomyVersion(),
        payload.feedbackItems().stream()
            .map(
                item ->
                    new MistakeFeedbackItem(
                        item.feedbackItemId(),
                        item.category(),
                        normalizedKey(item),
                        title(item),
                        item.note(),
                        item.originalText(),
                        item.improvedText()))
            .toList(),
        payload.completedAt());
  }

  private String normalizedKey(Item item) {
    return item.patternKey() == null || item.patternKey().isBlank()
        ? "unknown:" + item.feedbackItemId()
        : item.patternKey().trim();
  }

  private String title(Item item) {
    if (item.patternKey() == null || item.patternKey().isBlank()) {
      return switch (item.category()) {
        case "GRAMMAR" -> "Grammar correction";
        case "VOCABULARY" -> "Vocabulary correction";
        default -> "Expression correction";
      };
    }
    return item.patternKey().trim().replace('.', ' ').replace('_', ' ');
  }

  private Payload read(String json) {
    try {
      return objectMapper.readValue(json, Payload.class);
    } catch (JacksonException exception) {
      throw new IllegalArgumentException("Speaking evaluation event payload is invalid", exception);
    }
  }

  private void validate(PublishedEvent event, Payload payload) {
    if (event.schemaVersion() != 1
        || payload.evaluationId() == null
        || payload.userId() == null
        || payload.completedAt() == null
        || payload.taxonomyVersion() == null
        || payload.feedbackItems() == null
        || !payload.evaluationId().equals(event.aggregateId())
        || !payload.userId().equals(event.ownerUserId())
        || !payload.completedAt().equals(event.occurredAt())) {
      throw new IllegalArgumentException("Speaking evaluation event is inconsistent");
    }
    if (payload.taxonomyVersion().isBlank() || payload.taxonomyVersion().length() > 32) {
      throw new IllegalArgumentException("Speaking evaluation taxonomy version is invalid");
    }
    if (payload.feedbackItems().size() > 10
        || payload.feedbackItems().stream().anyMatch(this::invalid)
        || payload.feedbackItems().stream().map(Item::feedbackItemId).distinct().count()
            != payload.feedbackItems().size()) {
      throw new IllegalArgumentException("Speaking evaluation feedback items are invalid");
    }
  }

  private boolean invalid(Item item) {
    return item == null
        || item.feedbackItemId() == null
        || !CATEGORIES.contains(item.category())
        || item.note() == null
        || item.note().isBlank()
        || item.note().length() > 2000
        || (item.patternKey() != null && item.patternKey().length() > 100)
        || (item.originalText() != null && item.originalText().length() > 2000)
        || (item.improvedText() != null && item.improvedText().length() > 2000);
  }

  private record Payload(
      UUID evaluationId,
      UUID userId,
      Instant completedAt,
      String taxonomyVersion,
      List<Item> feedbackItems) {}

  private record Item(
      UUID feedbackItemId,
      String category,
      String patternKey,
      String note,
      String originalText,
      String improvedText) {}
}
