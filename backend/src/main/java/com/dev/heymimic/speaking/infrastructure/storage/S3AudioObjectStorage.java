package com.dev.heymimic.speaking.infrastructure.storage;

import com.dev.heymimic.speaking.application.port.AudioObjectBytes;
import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.application.port.AudioPlaybackGrant;
import com.dev.heymimic.speaking.application.port.AudioUploadGrant;
import com.dev.heymimic.speaking.application.port.VerifiedAudioObject;
import com.dev.heymimic.speaking.infrastructure.config.S3AudioConfiguration.Properties;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

public final class S3AudioObjectStorage implements AudioObjectStorage {
  private final S3Client client;
  private final S3Presigner presigner;
  private final Properties properties;
  private final ObjectMapper objectMapper;

  public S3AudioObjectStorage(S3Client client, S3Presigner presigner, Properties properties) {
    this(client, presigner, properties, new ObjectMapper());
  }

  public S3AudioObjectStorage(
      S3Client client, S3Presigner presigner, Properties properties, ObjectMapper objectMapper) {
    this.client = client;
    this.presigner = presigner;
    this.properties = properties;
    this.objectMapper = objectMapper;
  }

  @Override
  public AudioUploadGrant issueUpload(
      String objectKey, String mimeType, long sizeBytes, Instant expiresAt) {
    Duration signatureDuration = signatureDuration(expiresAt);
    PutObjectRequest request =
        PutObjectRequest.builder()
            .bucket(properties.bucket())
            .key(objectKey)
            .contentType(mimeType)
            .contentLength(sizeBytes)
            .build();
    var presigned =
        presigner.presignPutObject(
            PutObjectPresignRequest.builder()
                .signatureDuration(signatureDuration)
                .putObjectRequest(request)
                .build());
    return new AudioUploadGrant(
        presigned.url().toString(),
        Map.of("Content-Type", mimeType, "Content-Length", Long.toString(sizeBytes)),
        expiresAt);
  }

  @Override
  public VerifiedAudioObject inspectAndSeal(String objectKey) {
    AudioObjectBytes object = readObject(objectKey, null);
    MediaMetadata metadata = inspectMedia(object.content());
    return new VerifiedAudioObject(
        requireVersion(object.objectVersion()),
        sha256(object.content()),
        object.content().length,
        metadata.mimeType(),
        metadata.durationMs());
  }

  @Override
  public AudioPlaybackGrant issuePlayback(
      String objectKey, String objectVersion, Instant expiresAt) {
    requireVersion(objectVersion);
    var request =
        GetObjectRequest.builder()
            .bucket(properties.bucket())
            .key(objectKey)
            .versionId(objectVersion)
            .build();
    var presigned =
        presigner.presignGetObject(
            GetObjectPresignRequest.builder()
                .signatureDuration(signatureDuration(expiresAt))
                .getObjectRequest(request)
                .build());
    return new AudioPlaybackGrant(presigned.url().toString(), expiresAt);
  }

  @Override
  public AudioObjectBytes read(String objectKey, String objectVersion) {
    return readObject(objectKey, objectVersion);
  }

  @Override
  public void delete(String objectKey, String objectVersion) {
    requireVersion(objectVersion);
    client.deleteObject(
        DeleteObjectRequest.builder()
            .bucket(properties.bucket())
            .key(objectKey)
            .versionId(objectVersion)
            .build());
  }

  private AudioObjectBytes readObject(String objectKey, String requestedVersion) {
    HeadObjectResponse head =
        client.headObject(
            HeadObjectRequest.builder()
                .bucket(properties.bucket())
                .key(objectKey)
                .applyMutation(
                    builder -> {
                      if (requestedVersion != null && !requestedVersion.isBlank()) {
                        builder.versionId(requestedVersion);
                      }
                    })
                .build());
    if (head.contentLength() > properties.maxObjectBytes()) {
      throw new IllegalStateException("Audio object exceeds the configured size limit");
    }
    String headVersion = requireVersion(head.versionId());
    if (requestedVersion != null && !requestedVersion.equals(headVersion)) {
      throw new IllegalStateException("Storage returned a different audio object version");
    }
    GetObjectRequest request =
        GetObjectRequest.builder()
            .bucket(properties.bucket())
            .key(objectKey)
            .versionId(headVersion)
            .build();
    ResponseBytes<GetObjectResponse> response = client.getObjectAsBytes(request);
    byte[] bytes = response.asByteArray();
    if (bytes.length != head.contentLength()) {
      throw new IllegalStateException("Audio object changed while it was being read");
    }
    String version = requireVersion(response.response().versionId());
    if (!headVersion.equals(version)) {
      throw new IllegalStateException("Storage returned a different audio object version");
    }
    return new AudioObjectBytes(bytes, response.response().contentType(), version);
  }

  private MediaMetadata inspectMedia(byte[] bytes) {
    Path temp = null;
    Process process = null;
    try {
      temp = Files.createTempFile("heymimic-audio-", ".bin");
      Files.write(temp, bytes, StandardOpenOption.TRUNCATE_EXISTING);
      process =
          new ProcessBuilder(
                  List.of(
                      properties.ffprobeCommand(),
                      "-v",
                      "error",
                      "-show_entries",
                      "format=format_name,duration",
                      "-of",
                      "json",
                      temp.toString()))
              .redirectErrorStream(true)
              .start();
      if (!process.waitFor(properties.ffprobeTimeout().toMillis(), TimeUnit.MILLISECONDS)) {
        process.destroyForcibly();
        throw new IllegalStateException("Audio inspection timed out");
      }
      String output =
          new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
      if (process.exitValue() != 0 || output.isBlank()) {
        throw new IllegalStateException("Audio inspection failed");
      }
      JsonNode format = objectMapper.readTree(output).path("format");
      String formatNames = format.path("format_name").asText("");
      String durationValue = format.path("duration").asText("");
      if (formatNames.isBlank() || durationValue.isBlank()) {
        throw new IllegalStateException("Audio inspection returned incomplete metadata");
      }

      double durationSeconds = Double.parseDouble(durationValue);
      if (!Double.isFinite(durationSeconds) || durationSeconds <= 0) {
        throw new IllegalStateException("Audio duration is invalid");
      }
      String mimeType = mimeType(formatNames);
      return new MediaMetadata(mimeType, Math.round(durationSeconds * 1_000));
    } catch (IOException exception) {
      throw new IllegalStateException("Audio inspection could not be executed", exception);
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Audio inspection was interrupted", exception);
    } catch (NumberFormatException exception) {
      throw new IllegalStateException("Audio inspection returned invalid duration", exception);
    } finally {
      if (process != null && process.isAlive()) process.destroyForcibly();
      if (temp != null) {
        try {
          Files.deleteIfExists(temp);
        } catch (IOException ignored) {
          // Cleanup is best effort; the file is created in the process temp directory.
        }
      }
    }
  }

  private String mimeType(String formatNames) {
    String names = formatNames.toLowerCase(java.util.Locale.ROOT);
    if (names.contains("webm") || names.contains("matroska")) return "audio/webm";
    if (names.contains("ogg") || names.contains("opus")) return "audio/ogg";
    if (names.contains("wav")) return "audio/wav";
    if (names.contains("mp4") || names.contains("mov") || names.contains("m4a")) {
      return "audio/mp4";
    }
    throw new IllegalStateException("Unsupported audio container");
  }

  private String sha256(byte[] bytes) {
    try {
      return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is unavailable", exception);
    }
  }

  private Duration signatureDuration(Instant expiresAt) {
    Duration duration = Duration.between(Instant.now(), expiresAt);
    if (duration.isNegative() || duration.isZero()) {
      throw new IllegalArgumentException("Audio grant expiry must be in the future");
    }
    return duration;
  }

  private String requireVersion(String version) {
    if (version == null || version.isBlank() || version.length() > 200) {
      throw new IllegalStateException("Storage did not return an immutable object version");
    }
    return version;
  }

  private record MediaMetadata(String mimeType, long durationMs) {}
}
