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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.ObjectMapper;

class SpeakingSessionCompletedConsumerTest {
  private final ActivityLedgerStore ledger = mock(ActivityLedgerStore.class);
  private final DailyActivityStore dailyActivities = mock(DailyActivityStore.class);
  private final SpeakingSessionCompletedConsumer consumer =
      new SpeakingSessionCompletedConsumer(ledger, dailyActivities, new ObjectMapper());

  @Test
  void writesSpeakingDurationUsingTheSessionTimezoneDate() {
    UUID eventId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    Instant completedAt = Instant.parse("2026-09-08T17:30:00Z");
    var event = event(eventId, userId, sessionId, completedAt, userId, List.of(UUID.randomUUID()));
    when(ledger.append(any())).thenReturn(true);

    consumer.consume(event);

    var captor = ArgumentCaptor.forClass(ActivityLedgerEntry.class);
    verify(ledger).append(captor.capture());
    assertThat(captor.getValue())
        .isEqualTo(
            new ActivityLedgerEntry(
                eventId,
                userId,
                ProgressSourceType.SPEAKING_SESSION,
                sessionId,
                LocalDate.parse("2026-09-09"),
                "Asia/Bangkok",
                21,
                "speaking-duration-v1",
                completedAt));
    verify(dailyActivities)
        .add(
            userId,
            LocalDate.parse("2026-09-09"),
            ProgressSourceType.SPEAKING_SESSION,
            21,
            "Asia/Bangkok",
            completedAt);
  }

  @Test
  void rejectsDuplicateEvaluatedAttemptIds() {
    UUID userId = UUID.randomUUID();
    UUID attemptId = UUID.randomUUID();
    var event =
        event(
            UUID.randomUUID(),
            userId,
            UUID.randomUUID(),
            Instant.parse("2026-09-08T17:30:00Z"),
            userId,
            List.of(attemptId, attemptId));

    assertThatThrownBy(() -> consumer.consume(event))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Speaking event evaluated attempts are invalid");
  }

  private PublishedEvent event(
      UUID eventId,
      UUID ownerUserId,
      UUID sessionId,
      Instant completedAt,
      UUID payloadUserId,
      List<UUID> attempts) {
    String quote = Character.toString(34);
    String attemptJson =
        attempts.stream()
            .map(attemptId -> quote + attemptId + quote)
            .collect(Collectors.joining(","));
    String payload =
        """
        {"sessionId":"%s","userId":"%s","completedAt":"%s",
         "timezoneSnapshot":"Asia/Bangkok","acceptedDurationSeconds":21,
         "evaluatedAttemptIds":[%s],"ruleVersion":"speaking-duration-v1"}
        """
            .formatted(sessionId, payloadUserId, completedAt, attemptJson);
    return new PublishedEvent(
        UUID.randomUUID(),
        SpeakingSessionCompletedConsumer.CONSUMER_NAME,
        eventId,
        ownerUserId,
        SpeakingSessionCompletedConsumer.EVENT_TYPE,
        1,
        sessionId,
        completedAt,
        payload,
        1,
        1,
        completedAt.plusSeconds(120));
  }
}
