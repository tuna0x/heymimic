package com.dev.heymimic.study.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobExecutionFence;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.study.application.publicapi.DailyPlanRefreshWorkflow;
import java.util.UUID;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
public class DailyPlanJobHandler implements JobHandler {
  public static final String JOB_TYPE = "BUILD_DAILY_PLAN";
  private final DailyPlanRefreshWorkflow workflow;
  private final JobExecutionFence fence;
  private final ObjectMapper json;

  public DailyPlanJobHandler(
      DailyPlanRefreshWorkflow workflow, JobExecutionFence fence, ObjectMapper json) {
    this.workflow = workflow;
    this.fence = fence;
    this.json = json;
  }

  @Override
  public String jobType() {
    return JOB_TYPE;
  }

  @Override
  public void handle(ClaimedJob job) {
    RefreshPayload payload;
    try {
      payload = json.readValue(job.payloadJson(), RefreshPayload.class);
      if (payload == null
          || payload.requestId() == null
          || payload.userId() == null
          || (payload.goalMinutes() != 5
              && payload.goalMinutes() != 10
              && payload.goalMinutes() != 15)
          || payload.sourceBriefId() != null
          || !payload.userId().equals(job.ownerUserId())
          || !payload.requestId().equals(job.resourceId())) {
        throw new IllegalArgumentException("Planner payload does not match the claimed job");
      }
    } catch (RuntimeException invalid) {
      throw new NonRetryableJobException(
          "INVALID_DAILY_PLAN_PAYLOAD", "Daily plan job payload is invalid", invalid);
    }
    fence.run(
        job,
        () ->
            workflow.refresh(
                payload.requestId(),
                payload.userId(),
                payload.goalMinutes(),
                payload.sourceBriefId()));
  }

  @Override
  public void onFinalFailure(ClaimedJob job, String errorCode) {
    workflow.fail(job.resourceId(), errorCode);
  }

  public record RefreshPayload(UUID requestId, UUID userId, int goalMinutes, UUID sourceBriefId) {}
}
