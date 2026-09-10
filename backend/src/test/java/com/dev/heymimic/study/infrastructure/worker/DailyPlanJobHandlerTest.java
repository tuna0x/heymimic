package com.dev.heymimic.study.infrastructure.worker;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.study.application.publicapi.DailyPlanRefreshWorkflow;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class DailyPlanJobHandlerTest {
  private final DailyPlanRefreshWorkflow workflow = mock(DailyPlanRefreshWorkflow.class);
  private final DailyPlanJobHandler handler =
      new DailyPlanJobHandler(
          workflow, com.dev.heymimic.support.TestJobFences.direct(), new ObjectMapper());

  @Test
  void refreshesOnlyTheOwnerAndRequestBoundToTheClaimedJob() {
    UUID userId = UUID.randomUUID();
    UUID requestId = UUID.randomUUID();
    handler.handle(job(userId, requestId, payload(requestId, userId, 10)));

    verify(workflow).refresh(requestId, userId, 10, null);
  }

  @Test
  void rejectsPayloadThatCanCrossUserOrRequestBoundaries() {
    UUID userId = UUID.randomUUID();
    UUID requestId = UUID.randomUUID();
    assertThatThrownBy(
            () ->
                handler.handle(
                    job(userId, requestId, payload(UUID.randomUUID(), UUID.randomUUID(), 10))))
        .isInstanceOf(NonRetryableJobException.class)
        .hasMessageContaining("Daily plan job payload is invalid");
  }

  @Test
  void rejectsUnsupportedPlannerSettingsWithoutRetry() {
    UUID userId = UUID.randomUUID();
    UUID requestId = UUID.randomUUID();
    assertThatThrownBy(() -> handler.handle(job(userId, requestId, payload(requestId, userId, 7))))
        .isInstanceOf(NonRetryableJobException.class)
        .hasMessageContaining("Daily plan job payload is invalid");
  }

  @Test
  void marksRequestFailedAfterTerminalJobFailure() {
    UUID requestId = UUID.randomUUID();
    handler.onFinalFailure(job(UUID.randomUUID(), requestId, "{}"), "RETRY_BUDGET_EXHAUSTED");

    verify(workflow).fail(requestId, "RETRY_BUDGET_EXHAUSTED");
  }

  private ClaimedJob job(UUID userId, UUID requestId, String payload) {
    return new ClaimedJob(
        UUID.randomUUID(),
        userId,
        DailyPlanJobHandler.JOB_TYPE,
        requestId,
        1,
        payload,
        null,
        1,
        1,
        Instant.now().plusSeconds(60),
        "worker");
  }

  private String payload(UUID requestId, UUID userId, int goalMinutes) {
    return new ObjectMapper()
        .writeValueAsString(
            new DailyPlanJobHandler.RefreshPayload(requestId, userId, goalMinutes, null));
  }
}
