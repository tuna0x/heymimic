package com.dev.heymimic.platform.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.AccountWorkGuard;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
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
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "heymimic.jobs", name = "enabled", havingValue = "true")
public class PlatformJobWorker {
  private static final Logger log = LoggerFactory.getLogger(PlatformJobWorker.class);
  private static final Duration[] RETRY_DELAYS = {
    Duration.ofSeconds(10), Duration.ofSeconds(30), Duration.ofMinutes(2), Duration.ofMinutes(10)
  };

  private final JobQueue queue;
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

  public PlatformJobWorker(
      JobQueue queue,
      Collection<JobHandler> handlers,
      ObjectProvider<AccountWorkGuard> accountWorkGuard,
      JobWorkerConfiguration.Properties properties,
      Clock clock,
      PlatformWorkerMetrics metrics) {
    this.queue = queue;
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

  @Scheduled(fixedDelayString = "${heymimic.jobs.poll-interval:2s}")
  public void poll() {
    for (int index = 0; index < properties.batchSize(); index++) {
      var claimed = queue.claimNext(properties.workerId(), properties.lease());
      if (claimed.isEmpty()) {
        return;
      }
      execute(claimed.orElseThrow());
    }
  }

  void execute(ClaimedJob job) {
    long startedAt = System.nanoTime();
    String outcome = "worker_error";
    try {
      outcome = process(job);
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

    ScheduledFuture<?> heartbeat = startHeartbeat(job);
    try {
      handler.handle(job);
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
      try {
        handler.onFinalFailure(job, errorCode);
      } catch (RuntimeException callbackException) {
        log.error(
            "Final failure callback failed: jobId={}, type={}",
            job.id(),
            job.type(),
            callbackException);
      }
      boolean saved = finishFinal(job, errorCode);
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
    try {
      handler.onFinalFailure(job, errorCode);
    } catch (RuntimeException callbackException) {
      log.error(
          "Non-retryable failure callback failed: jobId={}, type={}",
          job.id(),
          job.type(),
          callbackException);
    }
    boolean saved = finishFinal(job, errorCode);
    log.error("Job failed without retry: jobId={}, type={}", job.id(), job.type(), exception);
    return saved ? "failed_final" : "lease_rejected";
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
