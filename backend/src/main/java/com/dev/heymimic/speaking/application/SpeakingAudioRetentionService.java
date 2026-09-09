package com.dev.heymimic.speaking.application;

import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import com.dev.heymimic.speaking.application.publicapi.AudioRetentionResult;
import java.time.Clock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SpeakingAudioRetentionService {
  private static final Logger log = LoggerFactory.getLogger(SpeakingAudioRetentionService.class);
  private final SpeakingAttemptStore attempts;
  private final AudioObjectStorage storage;
  private final SpeakingAudioRetentionCommitter committer;
  private final Clock clock;

  public SpeakingAudioRetentionService(
      SpeakingAttemptStore attempts,
      AudioObjectStorage storage,
      SpeakingAudioRetentionCommitter committer,
      Clock clock) {
    this.attempts = attempts;
    this.storage = storage;
    this.committer = committer;
    this.clock = clock;
  }

  public AudioRetentionResult cleanupExpiredBatch(int batchSize) {
    if (batchSize < 1 || batchSize > 1_000) {
      throw new IllegalArgumentException("Audio retention batch size must be between 1 and 1000");
    }
    var now = clock.instant();
    var expired = attempts.findExpiredAudio(now, batchSize);
    int deleted = 0;
    int failed = 0;
    for (var attempt : expired) {
      try {
        storage.delete(attempt.objectKey(), attempt.objectVersion());
        if (committer.markDeleted(attempt, now)) {
          deleted++;
        }
      } catch (RuntimeException exception) {
        failed++;
        log.warn("Could not delete expired speaking audio: attemptId={}", attempt.id(), exception);
      }
    }
    return new AudioRetentionResult(expired.size(), deleted, failed);
  }
}
