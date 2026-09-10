package com.dev.heymimic.platform.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.AccountWorkGuard;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobExecutionFence;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import com.dev.heymimic.platform.application.publicapi.JobLeaseLostException;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.platform.application.publicapi.RetryableJobException;
import com.dev.heymimic.platform.infrastructure.observability.PlatformWorkerMetrics;
import jakarta.annotation.PreDestroy;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class PlatformJobExecutor {
  private static final Logger log = LoggerFactory.getLogger(PlatformJobExecutor.class);
  private static final Duration[] RETRY_DELAYS = {
    Duration.ofSeconds(10), Duration.ofSeconds(30), Duration.ofMinutes(2), Duration.ofMinutes(10)
  };

  private final JobQueue queue;
  private final JobExecutionFence fence;
  private final TransactionTemplate transactions;
  private final Map<String, JobHandler> handlers;
  private final AccountWorkGuard accountWorkGuard;
  private final JobWorkerConfiguration.Properties properties;
  private final Clock clock;
  private final PlatformWorkerMetrics metrics;
  private final ScheduledExecutorService heartbeatExecutor =
      Executors.newSingleThreadScheduledExecutor(
          runnable -> {
            Thread thread = new Thread(runnable, "job-lease-heartbeat");
            thread.setDaemon(true);
            return thread;
          });

  public PlatformJobExecutor(
      JobQueue queue,
      Collection<JobHandler> handlers,
      ObjectProvider<AccountWorkGuard> accountWorkGuard,
      JobWorkerConfiguration.Properties properties,
      Clock clock,
      PlatformWorkerMetrics metrics,
      JobExecutionFence fence,
      TransactionTemplate transactions) {
    this.queue = queue;
    this.fence = fence;
    this.transactions = transactions;
    this.handlers =
        handlers.stream()
            .collect(
                Collectors.toUnmodifiableMap(
                    JobHandler::jobType,
                    Function.identity(),
                    (first, duplicate) -> {
                      throw new IllegalStateException(
                          "Multiple handlers registered for job type " + first.jobType());
                    }));
    this.accountWorkGuard = accountWorkGuard.getIfAvailable(() -> ownerUserId -> true);
    this.properties = properties;
    this.clock = clock;
    this.metrics = metrics;
  }

  public String execute(ClaimedJob job) {
    long startedAt = System.nanoTime();
    String outcome = "worker_error";
    try {
      outcome = process(job);
      return outcome;
    } finally {
      metrics.recordJob(job.type(), outcome, System.nanoTime() - startedAt);
    }
  }

  private String process(ClaimedJob job) {
    JobHandler handler = handlers.get(job.type());
    if (handler == null) {
      return finishFinal(job, "UNKNOWN_JOB_TYPE") ? "unknown_type" : "lease_rejected";
    }
    if (!handler.allowsInactiveOwner() && !accountWorkGuard.canStartWork(job.ownerUserId())) {
      return finishFinal(job, "ACCOUNT_INACTIVE") ? "owner_inactive" : "lease_rejected";
    }

    if (job.attempts() > properties.maxAttempts()) {
      if (handler.isCompleted(job)) {
        return queue.succeed(job.id(), properties.workerId(), job.leaseGeneration())
            ? "succeeded"
            : "lease_rejected";
      }
      return finalizeFailure(handler, job, "RETRY_BUDGET_EXHAUSTED")
          ? "failed_final"
          : "lease_rejected";
    }
    ScheduledFuture<?> heartbeat = startHeartbeat(job);
    try {
      handler.handle(job);
    } catch (JobLeaseLostException exception) {
      return "lease_rejected";
    } catch (NonRetryableJobException exception) {
      heartbeat.cancel(false);
      return failWithoutRetry(handler, job, exception.errorCode(), exception);
    } catch (RetryableJobException exception) {
      heartbeat.cancel(false);
      return retryOrFail(handler, job, exception.errorCode(), exception);
    } catch (Exception exception) {
      heartbeat.cancel(false);
      return retryOrFail(handler, job, "UNEXPECTED_ERROR", exception);
    } finally {
      heartbeat.cancel(false);
    }

    boolean saved = queue.succeed(job.id(), properties.workerId(), job.leaseGeneration());
    if (!saved) {
      log.warn("Job completion rejected by lease fence: jobId={}", job.id());
    }
    return saved ? "succeeded" : "lease_rejected";
  }

  private ScheduledFuture<?> startHeartbeat(ClaimedJob job) {
    long intervalMillis = Math.max(1_000, properties.lease().toMillis() / 3);
    return heartbeatExecutor.scheduleAtFixedRate(
        () -> {
          try {
            boolean renewed =
                queue.heartbeat(
                    job.id(), properties.workerId(), job.leaseGeneration(), properties.lease());
            if (!renewed) {
              log.warn("Job heartbeat rejected by lease fence: jobId={}", job.id());
            }
            metrics.recordJobHeartbeat(job.type(), renewed ? "renewed" : "lease_rejected");
          } catch (RuntimeException exception) {
            metrics.recordJobHeartbeat(job.type(), "error");
            log.error("Job heartbeat failed: jobId={}", job.id(), exception);
          }
        },
        intervalMillis,
        intervalMillis,
        TimeUnit.MILLISECONDS);
  }

  @PreDestroy
  void shutdownHeartbeatExecutor() {
    heartbeatExecutor.shutdownNow();
  }

  private String retryOrFail(
      JobHandler handler, ClaimedJob job, String errorCode, Exception exception) {
    if (job.attempts() >= properties.maxAttempts()) {
      boolean saved = finalizeFailure(handler, job, errorCode);
      log.error("Job exhausted retry budget: jobId={}, type={}", job.id(), job.type(), exception);
      return saved ? "failed_final" : "lease_rejected";
    }

    Duration delay = RETRY_DELAYS[Math.min(job.attempts() - 1, RETRY_DELAYS.length - 1)];
    Instant nextAttemptAt = clock.instant().plus(delay);
    boolean saved =
        queue.retry(
            job.id(), properties.workerId(), job.leaseGeneration(), errorCode, nextAttemptAt);
    if (!saved) {
      log.warn("Job retry rejected by lease fence: jobId={}", job.id());
    }
    return saved ? "retry_scheduled" : "lease_rejected";
  }

  private String failWithoutRetry(
      JobHandler handler, ClaimedJob job, String errorCode, Exception exception) {
    boolean saved = finalizeFailure(handler, job, errorCode);
    log.error("Job failed without retry: jobId={}, type={}", job.id(), job.type(), exception);
    return saved ? "failed_final" : "lease_rejected";
  }

  private boolean finalizeFailure(JobHandler handler, ClaimedJob job, String errorCode) {
    return Boolean.TRUE.equals(
        transactions.execute(
            status -> {
              fence.run(job, () -> handler.onFinalFailure(job, errorCode));
              if (!queue.failFinal(
                  job.id(), properties.workerId(), job.leaseGeneration(), errorCode)) {
                throw new JobLeaseLostException();
              }
              return true;
            }));
  }

  private boolean finishFinal(ClaimedJob job, String errorCode) {
    boolean saved =
        queue.failFinal(job.id(), properties.workerId(), job.leaseGeneration(), errorCode);
    if (!saved) {
      log.warn("Final job failure rejected by lease fence: jobId={}", job.id());
    }
    return saved;
  }
}
