package com.dev.heymimic.platform.application.publicapi;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface JobQueue {
  UUID enqueue(EnqueueJob command);

  Optional<ClaimedJob> claimNext(String workerId, Duration lease);

  boolean heartbeat(UUID jobId, String workerId, long generation, Duration lease);

  boolean saveCheckpoint(UUID jobId, String workerId, long generation, String checkpointJson);

  boolean succeed(UUID jobId, String workerId, long generation);

  boolean retry(
      UUID jobId, String workerId, long generation, String errorCode, Instant nextAttemptAt);

  boolean failFinal(UUID jobId, String workerId, long generation, String errorCode);
}
