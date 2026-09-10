package com.dev.heymimic.study.application.publicapi;

import java.util.UUID;

public interface DailyPlanRequests {
  CreatedDailyPlan compose(
      UUID userId, UUID idempotencyKey, Integer goalMinutes, UUID sourceBriefId);

  DailyPlanEnvelope today(UUID userId);
}
