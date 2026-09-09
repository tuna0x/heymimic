package com.dev.heymimic.speaking.application.port;

import java.time.Instant;

public interface AudioObjectStorage {
  AudioUploadGrant issueUpload(
      String objectKey, String mimeType, long sizeBytes, Instant expiresAt);

  VerifiedAudioObject inspectAndSeal(String objectKey);

  AudioPlaybackGrant issuePlayback(String objectKey, String objectVersion, Instant expiresAt);

  void delete(String objectKey, String objectVersion);

  default AudioObjectBytes read(String objectKey, String objectVersion) {
    throw new UnsupportedOperationException("Audio object read is not configured");
  }
}
