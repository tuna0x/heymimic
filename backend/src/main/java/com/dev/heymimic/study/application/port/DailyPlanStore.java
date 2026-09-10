package com.dev.heymimic.study.application.port;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyPlanStore {
  PlanningStateRecord upsertState(
      UUID userId, long inputVersion, int goalMinutes, UUID sourceBriefId, Instant now);

  UUID beginRequest(UUID userId, long inputVersion, Instant now);

  List<DailyPlanRefreshCandidate> findRefreshCandidates(Instant now, int limit);

  boolean createRefreshRequest(
      UUID requestId,
      UUID userId,
      long requestedInputVersion,
      Instant firstDirtyAt,
      Instant notBefore);

  boolean attachRefreshJob(UUID requestId, UUID jobId);

  boolean claimRefreshRequest(UUID requestId, UUID userId);

  void finishRequest(UUID requestId, String state, String errorCode, Instant now);

  long nextPlanVersion(UUID userId, LocalDate localDate, String timezoneSnapshot);

  void insertPlan(DailyPlanRecord plan, List<DailyPlanStepRecord> steps, Instant now);

  Optional<DailyPlanRecord> findCurrent(UUID userId, LocalDate localDate, String timezoneSnapshot);
}
