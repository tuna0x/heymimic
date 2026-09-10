package com.dev.heymimic.platform.infrastructure.worker;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.publicapi.AccountWorkGuard;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.platform.application.publicapi.RetryableJobException;
import com.dev.heymimic.platform.infrastructure.observability.PlatformWorkerMetrics;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.StaticListableBeanFactory;

class PlatformJobExecutorTest {
  private final SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();
  private final PlatformWorkerMetrics metrics = new PlatformWorkerMetrics(meterRegistry);

  @Test
  void schedulesRetryWithBackoffWhenHandlerReportsRetryableFailure() throws Exception {
    Instant now = Instant.parse("2026-09-07T08:00:00Z");
    JobQueue queue = mock(JobQueue.class);
    JobHandler handler =
        new JobHandler() {
          @Override
          public String jobType() {
            return "TEST";
          }

          @Override
          public void handle(ClaimedJob job) {
            throw new RetryableJobException("REMOTE_TIMEOUT", "timeout", null);
          }
        };
    var beanFactory = new StaticListableBeanFactory();
    var guardProvider = beanFactory.getBeanProvider(AccountWorkGuard.class);
    var properties =
        new JobWorkerConfiguration.Properties(
            true, "worker-a", 10, Duration.ofMinutes(2), Duration.ofSeconds(2), 5);
    var worker =
        new PlatformJobExecutor(
            queue,
            List.of(handler),
            guardProvider,
            properties,
            Clock.fixed(now, ZoneOffset.UTC),
            metrics,
            com.dev.heymimic.support.TestJobFences.direct(),
            com.dev.heymimic.support.TestJobFences.transactions());
    UUID jobId = UUID.randomUUID();
    var job =
        new ClaimedJob(
            jobId,
            UUID.randomUUID(),
            "TEST",
            UUID.randomUUID(),
            1,
            "{}",
            null,
            1,
            3,
            now.plusSeconds(120));
    when(queue.retry(
            eq(jobId), eq("worker-a"), eq(3L), eq("REMOTE_TIMEOUT"), eq(now.plusSeconds(10))))
        .thenReturn(true);

    worker.execute(job);

    verify(queue)
        .retry(eq(jobId), eq("worker-a"), eq(3L), eq("REMOTE_TIMEOUT"), eq(now.plusSeconds(10)));
  }

  @Test
  void maintenanceHandlerCanRunForInactiveOwner() throws Exception {
    Instant now = Instant.parse("2026-09-07T08:00:00Z");
    JobQueue queue = mock(JobQueue.class);
    AccountWorkGuard guard = mock(AccountWorkGuard.class);
    JobHandler handler =
        new JobHandler() {
          @Override
          public String jobType() {
            return "MAINTENANCE";
          }

          @Override
          public boolean allowsInactiveOwner() {
            return true;
          }

          @Override
          public void handle(ClaimedJob job) {}
        };
    var beanFactory = new StaticListableBeanFactory();
    beanFactory.addBean("guard", guard);
    var properties =
        new JobWorkerConfiguration.Properties(
            true, "worker-a", 10, Duration.ofMinutes(2), Duration.ofSeconds(2), 5);
    var worker =
        new PlatformJobExecutor(
            queue,
            List.of(handler),
            beanFactory.getBeanProvider(AccountWorkGuard.class),
            properties,
            Clock.fixed(now, ZoneOffset.UTC),
            metrics,
            com.dev.heymimic.support.TestJobFences.direct(),
            com.dev.heymimic.support.TestJobFences.transactions());
    UUID jobId = UUID.randomUUID();
    var job =
        new ClaimedJob(
            jobId,
            UUID.randomUUID(),
            "MAINTENANCE",
            UUID.randomUUID(),
            1,
            "{}",
            null,
            1,
            3,
            now.plusSeconds(120));
    when(queue.succeed(jobId, "worker-a", 3)).thenReturn(true);

    worker.execute(job);

    verify(guard, never()).canStartWork(job.ownerUserId());
    verify(queue).succeed(jobId, "worker-a", 3);
  }

  @Test
  void terminalFailureNotifiesHandlerAndDoesNotConsumeRetryBudget() throws Exception {
    Instant now = Instant.parse("2026-09-07T08:00:00Z");
    JobQueue queue = mock(JobQueue.class);
    JobHandler handler = mock(JobHandler.class);
    when(handler.jobType()).thenReturn("TEST");
    org.mockito.Mockito.doThrow(
            new NonRetryableJobException("REMOTE_REQUEST_REJECTED", "invalid request", null))
        .when(handler)
        .handle(any(ClaimedJob.class));
    var beanFactory = new StaticListableBeanFactory();
    var properties =
        new JobWorkerConfiguration.Properties(
            true, "worker-a", 10, Duration.ofMinutes(2), Duration.ofSeconds(2), 5);
    var worker =
        new PlatformJobExecutor(
            queue,
            List.of(handler),
            beanFactory.getBeanProvider(AccountWorkGuard.class),
            properties,
            Clock.fixed(now, ZoneOffset.UTC),
            metrics,
            com.dev.heymimic.support.TestJobFences.direct(),
            com.dev.heymimic.support.TestJobFences.transactions());
    UUID jobId = UUID.randomUUID();
    var job =
        new ClaimedJob(
            jobId,
            UUID.randomUUID(),
            "TEST",
            UUID.randomUUID(),
            1,
            "{}",
            null,
            1,
            3,
            now.plusSeconds(120));
    when(queue.failFinal(jobId, "worker-a", 3, "REMOTE_REQUEST_REJECTED")).thenReturn(true);

    worker.execute(job);

    var ordered = org.mockito.Mockito.inOrder(handler, queue);
    ordered.verify(handler).onFinalFailure(job, "REMOTE_REQUEST_REJECTED");
    ordered.verify(queue).failFinal(jobId, "worker-a", 3, "REMOTE_REQUEST_REJECTED");
    verify(queue, never()).retry(any(), any(), anyLong(), any(), any());
  }

  @Test
  void notifiesHandlerBeforeMarkingJobFailedWhenRetryBudgetIsExhausted() throws Exception {
    Instant now = Instant.parse("2026-09-07T08:00:00Z");
    JobQueue queue = mock(JobQueue.class);
    JobHandler handler = mock(JobHandler.class);
    when(handler.jobType()).thenReturn("TEST");
    org.mockito.Mockito.doThrow(new RetryableJobException("REMOTE_TIMEOUT", "timeout", null))
        .when(handler)
        .handle(any(ClaimedJob.class));
    var beanFactory = new StaticListableBeanFactory();
    var properties =
        new JobWorkerConfiguration.Properties(
            true, "worker-a", 10, Duration.ofMinutes(2), Duration.ofSeconds(2), 5);
    var worker =
        new PlatformJobExecutor(
            queue,
            List.of(handler),
            beanFactory.getBeanProvider(AccountWorkGuard.class),
            properties,
            Clock.fixed(now, ZoneOffset.UTC),
            metrics,
            com.dev.heymimic.support.TestJobFences.direct(),
            com.dev.heymimic.support.TestJobFences.transactions());
    UUID jobId = UUID.randomUUID();
    var job =
        new ClaimedJob(
            jobId,
            UUID.randomUUID(),
            "TEST",
            UUID.randomUUID(),
            1,
            "{}",
            null,
            5,
            3,
            now.plusSeconds(120));
    when(queue.failFinal(jobId, "worker-a", 3, "REMOTE_TIMEOUT")).thenReturn(true);

    worker.execute(job);

    var ordered = org.mockito.Mockito.inOrder(handler, queue);
    ordered.verify(handler).onFinalFailure(job, "REMOTE_TIMEOUT");
    ordered.verify(queue).failFinal(jobId, "worker-a", 3, "REMOTE_TIMEOUT");
    verify(queue, never()).retry(any(), any(), anyLong(), any(), any());
  }

  @Test
  void reclaimedExhaustedJobFinalizesWithoutCallingProvider() throws Exception {
    JobQueue queue = mock(JobQueue.class);
    JobHandler handler = mock(JobHandler.class);
    when(handler.jobType()).thenReturn("TEST");
    when(queue.failFinal(any(), anyString(), anyLong(), anyString())).thenReturn(true);
    var worker =
        new PlatformJobExecutor(
            queue,
            List.of(handler),
            new StaticListableBeanFactory().getBeanProvider(AccountWorkGuard.class),
            new JobWorkerConfiguration.Properties(
                true, "worker", 1, Duration.ofMinutes(2), Duration.ofSeconds(2), 5),
            Clock.systemUTC(),
            metrics,
            com.dev.heymimic.support.TestJobFences.direct(),
            com.dev.heymimic.support.TestJobFences.transactions());
    var job =
        new ClaimedJob(
            UUID.randomUUID(),
            null,
            "TEST",
            UUID.randomUUID(),
            1,
            "{}",
            null,
            6,
            6,
            Instant.now().plusSeconds(120));
    worker.execute(job);
    verify(handler, never()).handle(any());
    verify(handler).onFinalFailure(job, "RETRY_BUDGET_EXHAUSTED");
    org.mockito.Mockito.doThrow(new IllegalStateException("finalization unavailable"))
        .when(handler)
        .onFinalFailure(job, "RETRY_BUDGET_EXHAUSTED");
    org.mockito.Mockito.clearInvocations(queue);
    org.assertj.core.api.Assertions.assertThatThrownBy(() -> worker.execute(job))
        .isInstanceOf(IllegalStateException.class);
    verify(queue, never()).failFinal(any(), anyString(), anyLong(), anyString());
    worker.shutdownHeartbeatExecutor();
  }
}
