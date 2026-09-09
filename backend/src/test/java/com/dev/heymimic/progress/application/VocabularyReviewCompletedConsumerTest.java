package com.dev.heymimic.progress.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import com.dev.heymimic.progress.application.port.ActivityLedgerEntry;
import com.dev.heymimic.progress.application.port.ActivityLedgerStore;
import com.dev.heymimic.progress.application.port.DailyActivityStore;
import com.dev.heymimic.progress.domain.ProgressSourceType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.ObjectMapper;

class VocabularyReviewCompletedConsumerTest {
  private final ActivityLedgerStore ledger = mock(ActivityLedgerStore.class);
  private final DailyActivityStore dailyActivities = mock(DailyActivityStore.class);
  private final VocabularyReviewCompletedConsumer consumer =
      new VocabularyReviewCompletedConsumer(ledger, dailyActivities, new ObjectMapper());

  @Test
  void writesImmutableLedgerEntryUsingTheSessionTimezoneDate() {
    UUID eventId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    Instant completedAt = Instant.parse("2026-09-08T17:30:00Z");
    var event = event(eventId, userId, sessionId, completedAt, userId);
    when(ledger.append(any())).thenReturn(true);

    consumer.consume(event);

    var captor = ArgumentCaptor.forClass(ActivityLedgerEntry.class);
    verify(ledger).append(captor.capture());
    assertThat(captor.getValue())
        .isEqualTo(
            new ActivityLedgerEntry(
                eventId,
                userId,
                ProgressSourceType.VOCABULARY_REVIEW,
                sessionId,
                LocalDate.parse("2026-09-09"),
                "Asia/Bangkok",
                60,
                "simple-v1",
                completedAt));
    verify(dailyActivities)
        .add(
            userId,
            LocalDate.parse("2026-09-09"),
            ProgressSourceType.VOCABULARY_REVIEW,
            60,
            "Asia/Bangkok",
            completedAt);
  }

  @Test
  void rejectsPayloadWhoseOwnerDoesNotMatchTheEventEnvelope() {
    UUID userId = UUID.randomUUID();
    var event =
        event(
            UUID.randomUUID(),
            userId,
            UUID.randomUUID(),
            Instant.parse("2026-09-08T17:30:00Z"),
            UUID.randomUUID());

    assertThatThrownBy(() -> consumer.consume(event))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Review event envelope does not match its payload");
  }

  private PublishedEvent event(
      UUID eventId, UUID ownerUserId, UUID sessionId, Instant completedAt, UUID payloadUserId) {
    String payload =
        """
        {"sessionId":"%s","userId":"%s","completedAt":"%s",
         "timezoneSnapshot":"Asia/Bangkok","acceptedDurationSeconds":60,
         "ruleVersion":"simple-v1"}
        """
            .formatted(sessionId, payloadUserId, completedAt);
    return new PublishedEvent(
        UUID.randomUUID(),
        VocabularyReviewCompletedConsumer.CONSUMER_NAME,
        eventId,
        ownerUserId,
        VocabularyReviewCompletedConsumer.EVENT_TYPE,
        1,
        sessionId,
        completedAt,
        payload,
        1,
        1,
        completedAt.plusSeconds(120));
  }
}
