package com.dev.heymimic.progress.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.dev.heymimic.platform.application.publicapi.PublishedEvent;
import com.dev.heymimic.progress.application.port.MistakePatternStore;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.ObjectMapper;

class SpeakingEvaluationCompletedConsumerTest {
  private final MistakePatternStore mistakes = mock(MistakePatternStore.class);
  private final SpeakingEvaluationCompletedConsumer consumer =
      new SpeakingEvaluationCompletedConsumer(mistakes, new ObjectMapper());

  @Test
  void mapsValidatedFeedbackAndKeepsUnknownItemsSeparate() {
    UUID userId = UUID.randomUUID();
    UUID evaluationId = UUID.randomUUID();
    UUID knownId = UUID.randomUUID();
    UUID unknownId = UUID.randomUUID();
    Instant completedAt = Instant.parse("2026-09-08T03:00:00Z");
    String payload =
        """
        {"evaluationId":"%s","userId":"%s","completedAt":"%s",
         "taxonomyVersion":"speaking-feedback-v1","feedbackItems":[
          {"feedbackItemId":"%s","category":"GRAMMAR","patternKey":"grammar.past",
           "note":"Use past tense","originalText":"I go","improvedText":"I went"},
          {"feedbackItemId":"%s","category":"EXPRESSION","patternKey":null,
           "note":"Use a natural phrase","originalText":"very good","improvedText":"excellent"}
         ]}
        """
            .formatted(evaluationId, userId, completedAt, knownId, unknownId);
    consumer.consume(event(userId, evaluationId, completedAt, payload));

    var captor = ArgumentCaptor.forClass(java.util.List.class);
    verify(mistakes)
        .record(
            org.mockito.ArgumentMatchers.eq(userId),
            org.mockito.ArgumentMatchers.eq(evaluationId),
            org.mockito.ArgumentMatchers.eq("speaking-feedback-v1"),
            captor.capture(),
            org.mockito.ArgumentMatchers.eq(completedAt));
    var items =
        (java.util.List<com.dev.heymimic.progress.application.port.MistakeFeedbackItem>)
            captor.getValue();
    assertThat(items.get(0).patternKey()).isEqualTo("grammar.past");
    assertThat(items.get(1).patternKey()).isEqualTo("unknown:" + unknownId);
  }

  @Test
  void rejectsOwnerMismatch() {
    UUID evaluationId = UUID.randomUUID();
    Instant completedAt = Instant.parse("2026-09-08T03:00:00Z");
    String payload =
        """
        {"evaluationId":"%s","userId":"%s","completedAt":"%s",
         "taxonomyVersion":"speaking-feedback-v1","feedbackItems":[]}
        """
            .formatted(evaluationId, UUID.randomUUID(), completedAt);

    assertThatThrownBy(
            () -> consumer.consume(event(UUID.randomUUID(), evaluationId, completedAt, payload)))
        .isInstanceOf(IllegalArgumentException.class);
  }

  private PublishedEvent event(UUID userId, UUID evaluationId, Instant occurredAt, String payload) {
    return new PublishedEvent(
        UUID.randomUUID(),
        SpeakingEvaluationCompletedConsumer.CONSUMER_NAME,
        UUID.randomUUID(),
        userId,
        SpeakingEvaluationCompletedConsumer.EVENT_TYPE,
        1,
        evaluationId,
        occurredAt,
        payload,
        1,
        1,
        occurredAt.plusSeconds(120));
  }
}
