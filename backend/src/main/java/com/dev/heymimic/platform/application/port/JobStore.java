package com.dev.heymimic.platform.application.port;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.EnqueueJob;
import com.dev.heymimic.platform.domain.JobStatus;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface JobStore {
  UUID enqueue(UUID jobId, EnqueueJob command, Instant now);

  Optional<ClaimedJob> claimNext(String workerId, Instant now, Duration lease);

  boolean heartbeat(UUID jobId, String workerId, long generation, Instant now, Duration lease);

  boolean saveCheckpoint(
      UUID jobId, String workerId, long generation, String checkpointJson, Instant now);

  boolean finish(
      UUID jobId,
      String workerId,
      long generation,
      JobStatus status,
      String errorCode,
      Instant nextAttemptAt,
      Instant now);
}
