package com.dev.heymimic.speaking.infrastructure.storage;

import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.application.port.AudioPlaybackGrant;
import com.dev.heymimic.speaking.application.port.AudioUploadGrant;
import com.dev.heymimic.speaking.application.port.VerifiedAudioObject;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "heymimic.speaking", name = "fake-storage", havingValue = "true")
public class DevelopmentAudioObjectStorage implements AudioObjectStorage {
  @Override
  public AudioUploadGrant issueUpload(
      String objectKey, String mimeType, long sizeBytes, Instant expiresAt) {
    String encodedKey = URLEncoder.encode(objectKey, StandardCharsets.UTF_8);
    return new AudioUploadGrant(
        "https://storage.invalid/heymimic-development/" + encodedKey,
        Map.of("Content-Type", mimeType, "Content-Length", Long.toString(sizeBytes)),
        expiresAt);
  }

  @Override
  public VerifiedAudioObject inspectAndSeal(String objectKey) {
    throw new IllegalStateException(
        "Development fake storage has no uploaded bytes to verify; configure a real storage adapter");
  }

  @Override
  public AudioPlaybackGrant issuePlayback(
      String objectKey, String objectVersion, Instant expiresAt) {
    String encodedKey = URLEncoder.encode(objectKey, StandardCharsets.UTF_8);
    return new AudioPlaybackGrant(
        "https://storage.invalid/heymimic-development/" + encodedKey + "?version=" + objectVersion,
        expiresAt);
  }

  @Override
  public void delete(String objectKey, String objectVersion) {
    // The development adapter never stores bytes. Deletion remains deliberately idempotent.
  }
}
