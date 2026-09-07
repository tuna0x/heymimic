package com.dev.heymimic.platform.application;

import com.dev.heymimic.platform.application.port.JobStore;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.platform.domain.JobStatus;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformJobService implements JobQueue {
  private final JobStore store;
  private final Clock clock;

  public PlatformJobService(JobStore store, Clock clock) {
    this.store = store;
    this.clock = clock;
  }

  @Override
  @Transactional
  public UUID enqueue(EnqueueJob command) {
    return store.enqueue(UUID.randomUUID(), command, clock.instant());
  }

  @Override
  @Transactional
  public Optional<ClaimedJob> claimNext(String workerId, Duration lease) {
    validateLease(workerId, lease);
    return store.claimNext(workerId, clock.instant(), lease);
  }

  @Override
  @Transactional
  public boolean heartbeat(UUID jobId, String workerId, long generation, Duration lease) {
    validateLease(workerId, lease);
    return store.heartbeat(jobId, workerId, generation, clock.instant(), lease);
  }

  @Override
  @Transactional
  public boolean saveCheckpoint(
      UUID jobId, String workerId, long generation, String checkpointJson) {
    return store.saveCheckpoint(jobId, workerId, generation, checkpointJson, clock.instant());
  }

  @Override
  @Transactional
  public boolean succeed(UUID jobId, String workerId, long generation) {
    return finish(jobId, workerId, generation, JobStatus.SUCCEEDED, null, null);
  }

  @Override
  @Transactional
  public boolean retry(
      UUID jobId, String workerId, long generation, String errorCode, Instant nextAttemptAt) {
    if (nextAttemptAt == null || nextAttemptAt.isBefore(clock.instant())) {
      throw new IllegalArgumentException("nextAttemptAt must not be in the past");
    }
    return finish(
        jobId, workerId, generation, JobStatus.FAILED_RETRYABLE, errorCode, nextAttemptAt);
  }

  @Override
  @Transactional
  public boolean failFinal(UUID jobId, String workerId, long generation, String errorCode) {
    return finish(jobId, workerId, generation, JobStatus.FAILED_FINAL, errorCode, null);
  }

  private boolean finish(
      UUID id, String worker, long generation, JobStatus status, String error, Instant next) {
    return store.finish(id, worker, generation, status, error, next, clock.instant());
  }

  private void validateLease(String workerId, Duration lease) {
    if (workerId == null || workerId.isBlank())
      throw new IllegalArgumentException("workerId is required");
    if (lease == null || lease.isNegative() || lease.isZero())
      throw new IllegalArgumentException("lease must be positive");
  }
}
