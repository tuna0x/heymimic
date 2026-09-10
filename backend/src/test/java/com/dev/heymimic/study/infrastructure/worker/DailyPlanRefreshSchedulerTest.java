package com.dev.heymimic.study.infrastructure.worker;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.study.application.port.DailyPlanRefreshCandidate;
import com.dev.heymimic.study.application.port.DailyPlanStore;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class DailyPlanRefreshSchedulerTest {
  private final DailyPlanStore plans = org.mockito.Mockito.mock(DailyPlanStore.class);
  private final JobQueue jobs = org.mockito.Mockito.mock(JobQueue.class);
  private final Instant now = Instant.parse("2026-09-10T01:00:00Z");
  private final DailyPlanRefreshScheduler scheduler =
      new DailyPlanRefreshScheduler(
          plans,
          jobs,
          Clock.fixed(now, ZoneOffset.UTC),
          new ObjectMapper(),
          new DailyPlanRefreshScheduler.Properties(true, Duration.ofSeconds(1), 100));

  @Test
  void coalescesCandidateAndAttachesTheQueuedJobToRequest() {
    UUID userId = UUID.randomUUID();
    UUID planId = UUID.randomUUID();
    UUID jobId = UUID.randomUUID();
    when(plans.findRefreshCandidates(now, 100))
        .thenReturn(
            List.of(
                new DailyPlanRefreshCandidate(userId, planId, 7, 10, null, now.minusSeconds(1))));
    when(plans.createRefreshRequest(any(), any(), any(Long.class), any(), any())).thenReturn(true);
    when(jobs.enqueue(any(EnqueueJob.class))).thenReturn(jobId);
    when(plans.attachRefreshJob(any(), any())).thenReturn(true);

    scheduler.poll();

    verify(jobs)
        .enqueue(
            argThat(
                command ->
                    DailyPlanJobHandler.JOB_TYPE.equals(command.type())
                        && userId.equals(command.ownerUserId())
                        && command.resourceId() != null
                        && command.runAt().isAfter(now)));
    verify(plans).attachRefreshJob(any(), org.mockito.ArgumentMatchers.eq(jobId));
  }

  @Test
  void skipsCandidateWhenAnActiveRequestAlreadyExists() {
    UUID userId = UUID.randomUUID();
    when(plans.findRefreshCandidates(now, 100))
        .thenReturn(
            List.of(
                new DailyPlanRefreshCandidate(
                    userId, UUID.randomUUID(), 3, 5, null, now.minusSeconds(1))));
    when(plans.createRefreshRequest(any(), any(), any(Long.class), any(), any())).thenReturn(false);

    scheduler.poll();

    verify(jobs, never()).enqueue(any());
  }

  @Test
  void rejectsARequestThatCannotBeLinkedToItsJob() {
    UUID userId = UUID.randomUUID();
    when(plans.findRefreshCandidates(now, 100))
        .thenReturn(
            List.of(
                new DailyPlanRefreshCandidate(
                    userId, UUID.randomUUID(), 3, 5, null, now.minusSeconds(1))));
    when(plans.createRefreshRequest(any(), any(), any(Long.class), any(), any())).thenReturn(true);
    when(jobs.enqueue(any(EnqueueJob.class))).thenReturn(UUID.randomUUID());
    when(plans.attachRefreshJob(any(), any())).thenReturn(false);

    org.assertj.core.api.Assertions.assertThatThrownBy(scheduler::poll)
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("not attachable");
  }
}
