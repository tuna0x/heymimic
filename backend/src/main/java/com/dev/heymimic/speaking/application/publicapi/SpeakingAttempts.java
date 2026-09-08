package com.dev.heymimic.speaking.application.publicapi;

import java.util.UUID;

public interface SpeakingAttempts {
  AttemptUploadView create(
      UUID userId, UUID idempotencyKey, UUID sessionId, String mimeType, long sizeBytes);

  AttemptUploadView renewUpload(UUID userId, UUID attemptId, long expectedVersion);

  SpeakingAttemptView completeUpload(UUID userId, UUID attemptId, String checksumSha256);

  AttemptPlaybackView playback(UUID userId, UUID attemptId);
}
