package com.dev.heymimic.study.application.publicapi;

import java.util.UUID;

public interface DailyPlanRefreshWorkflow {
  void refresh(UUID requestId, UUID userId, int goalMinutes, UUID sourceBriefId);

  void fail(UUID requestId, String errorCode);
}
