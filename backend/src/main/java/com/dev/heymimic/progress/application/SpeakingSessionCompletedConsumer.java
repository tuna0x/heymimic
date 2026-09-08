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
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class SpeakingSessionCompletedConsumer implements EventConsumer {
  static final String EVENT_TYPE = "SpeakingSessionCompleted";
  static final String CONSUMER_NAME = "progress-speaking-session-ledger-v1";
  private static final int MAX_SESSION_DURATION_SECONDS = 24 * 60 * 60;
  private final ActivityLedgerStore ledger;
  private final DailyActivityStore dailyActivities;
  private final ObjectMapper objectMapper;

  public SpeakingSessionCompletedConsumer(
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
    SpeakingCompletedPayload payload = readPayload(event.payloadJson());
    validate(event, payload);
    ZoneId timezone;
    try {
      timezone = ZoneId.of(payload.timezoneSnapshot());
    } catch (ZoneRulesException exception) {
      throw new IllegalArgumentException("Speaking event contains an invalid timezone", exception);
    }
    var entry =
        new ActivityLedgerEntry(
            event.eventId(),
            payload.userId(),
            ProgressSourceType.SPEAKING_SESSION,
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

  private SpeakingCompletedPayload readPayload(String json) {
    try {
      return objectMapper.readValue(json, SpeakingCompletedPayload.class);
    } catch (JacksonException exception) {
      throw new IllegalArgumentException("Speaking event payload is not valid JSON", exception);
    }
  }

  private void validate(PublishedEvent event, SpeakingCompletedPayload payload) {
    if (event.schemaVersion() != 1) {
      throw new IllegalArgumentException("Unsupported speaking event schema version");
    }
    if (payload.sessionId() == null
        || payload.userId() == null
        || payload.completedAt() == null
        || payload.timezoneSnapshot() == null
        || payload.evaluatedAttemptIds() == null
        || payload.ruleVersion() == null) {
      throw new IllegalArgumentException("Speaking event payload is incomplete");
    }
    if (!payload.sessionId().equals(event.aggregateId())
        || !payload.userId().equals(event.ownerUserId())
        || !payload.completedAt().equals(event.occurredAt())) {
      throw new IllegalArgumentException("Speaking event envelope does not match its payload");
    }
    if (payload.timezoneSnapshot().isBlank() || payload.timezoneSnapshot().length() > 64) {
      throw new IllegalArgumentException("Speaking event timezone is invalid");
    }
    if (payload.ruleVersion().isBlank() || payload.ruleVersion().length() > 32) {
      throw new IllegalArgumentException("Speaking event rule version is invalid");
    }
    if (payload.acceptedDurationSeconds() < 0
        || payload.acceptedDurationSeconds() > MAX_SESSION_DURATION_SECONDS) {
      throw new IllegalArgumentException("Speaking event duration is outside the accepted range");
    }
    if (payload.evaluatedAttemptIds().isEmpty()
        || payload.evaluatedAttemptIds().stream().anyMatch(java.util.Objects::isNull)
        || payload.evaluatedAttemptIds().stream().distinct().count()
            != payload.evaluatedAttemptIds().size()) {
      throw new IllegalArgumentException("Speaking event evaluated attempts are invalid");
    }
  }

  private record SpeakingCompletedPayload(
      UUID sessionId,
      UUID userId,
      Instant completedAt,
      String timezoneSnapshot,
      int acceptedDurationSeconds,
      List<UUID> evaluatedAttemptIds,
      String ruleVersion) {}
}
