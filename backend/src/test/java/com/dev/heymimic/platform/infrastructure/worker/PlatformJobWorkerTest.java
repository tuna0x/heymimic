package com.dev.heymimic.platform.infrastructure.worker;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.publicapi.AccountWorkGuard;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.StaticListableBeanFactory;

class PlatformJobWorkerTest {
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
        new PlatformJobWorker(
            queue, List.of(handler), guardProvider, properties, Clock.fixed(now, ZoneOffset.UTC));
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
}
