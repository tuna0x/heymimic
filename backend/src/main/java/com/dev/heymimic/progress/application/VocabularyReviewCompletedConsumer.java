package com.dev.heymimic.progress.application;

import com.dev.heymimic.platform.application.publicapi.EventConsumer;
import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import com.dev.heymimic.progress.application.port.ActivityLedgerEntry;
import com.dev.heymimic.progress.application.port.ActivityLedgerStore;
import com.dev.heymimic.progress.application.port.DailyActivityStore;
import com.dev.heymimic.progress.domain.ProgressSourceType;
import java.time.Instant;
import java.time.ZoneId;
import java.time.zone.ZoneRulesException;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class VocabularyReviewCompletedConsumer implements EventConsumer {
  static final String EVENT_TYPE = "VocabularyReviewCompleted";
  static final String CONSUMER_NAME = "progress-activity-ledger-v1";
  private static final int MAX_REVIEW_DURATION_SECONDS = 50 * 120;
  private final ActivityLedgerStore ledger;
  private final DailyActivityStore dailyActivities;
  private final ObjectMapper objectMapper;

  public VocabularyReviewCompletedConsumer(
      ActivityLedgerStore ledger, DailyActivityStore dailyActivities, ObjectMapper objectMapper) {
    this.ledger = ledger;
    this.dailyActivities = dailyActivities;
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
    ReviewCompletedPayload payload = readPayload(event.payloadJson());
    validate(event, payload);
    ZoneId timezone;
    try {
      timezone = ZoneId.of(payload.timezoneSnapshot());
    } catch (ZoneRulesException exception) {
      throw new IllegalArgumentException("Review event contains an invalid timezone", exception);
    }
    var entry =
        new ActivityLedgerEntry(
            event.eventId(),
            payload.userId(),
            ProgressSourceType.VOCABULARY_REVIEW,
            payload.sessionId(),
            payload.completedAt().atZone(timezone).toLocalDate(),
            payload.timezoneSnapshot(),
            payload.acceptedDurationSeconds(),
            payload.ruleVersion(),
            event.occurredAt());
    if (ledger.append(entry)) {
      dailyActivities.add(
          entry.userId(),
          entry.activityDate(),
          entry.sourceType(),
          entry.durationSeconds(),
          entry.timezoneSnapshot(),
          entry.occurredAt());
    }
  }

  private ReviewCompletedPayload readPayload(String json) {
    try {
      return objectMapper.readValue(json, ReviewCompletedPayload.class);
    } catch (JacksonException exception) {
      throw new IllegalArgumentException("Review event payload is not valid JSON", exception);
    }
  }

  private void validate(PublishedEvent event, ReviewCompletedPayload payload) {
    if (event.schemaVersion() != 1) {
      throw new IllegalArgumentException("Unsupported review event schema version");
    }
    if (payload.sessionId() == null
        || payload.userId() == null
        || payload.completedAt() == null
        || payload.timezoneSnapshot() == null
        || payload.ruleVersion() == null) {
      throw new IllegalArgumentException("Review event payload is incomplete");
    }
    if (!payload.sessionId().equals(event.aggregateId())
        || !payload.userId().equals(event.ownerUserId())
        || !payload.completedAt().equals(event.occurredAt())) {
      throw new IllegalArgumentException("Review event envelope does not match its payload");
    }
    if (payload.timezoneSnapshot().isBlank() || payload.timezoneSnapshot().length() > 64) {
      throw new IllegalArgumentException("Review event timezone is invalid");
    }
    if (payload.ruleVersion().isBlank() || payload.ruleVersion().length() > 32) {
      throw new IllegalArgumentException("Review event rule version is invalid");
    }
    if (payload.acceptedDurationSeconds() < 0
        || payload.acceptedDurationSeconds() > MAX_REVIEW_DURATION_SECONDS) {
      throw new IllegalArgumentException("Review event duration is outside the accepted range");
    }
  }

  private record ReviewCompletedPayload(
      UUID sessionId,
      UUID userId,
      Instant completedAt,
      String timezoneSnapshot,
      int acceptedDurationSeconds,
      String ruleVersion) {}
}
