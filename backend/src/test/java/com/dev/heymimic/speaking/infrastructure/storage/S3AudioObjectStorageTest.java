package com.dev.heymimic.speaking.infrastructure.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.speaking.application.port.AudioObjectBytes;
import com.dev.heymimic.speaking.infrastructure.config.S3AudioConfiguration.Properties;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

class S3AudioObjectStorageTest {
  @Test
  void readsTheRequestedImmutableVersionAndRejectsVersionDrift() {
    S3Client client = mock(S3Client.class);
    S3Presigner presigner = mock(S3Presigner.class);
    byte[] bytes = new byte[] {1, 2, 3};
    when(client.headObject(any(HeadObjectRequest.class)))
        .thenReturn(HeadObjectResponse.builder().contentLength(3L).versionId("version-1").build());
    when(client.getObjectAsBytes(
            any(software.amazon.awssdk.services.s3.model.GetObjectRequest.class)))
        .thenReturn(
            ResponseBytes.fromByteArray(
                GetObjectResponse.builder()
                    .contentLength(3L)
                    .contentType("audio/webm")
                    .versionId("version-1")
                    .build(),
                bytes));

    var storage = new S3AudioObjectStorage(client, presigner, properties());

    AudioObjectBytes result = storage.read("speaking/a.webm", "version-1");

    assertThat(result.content()).containsExactly(bytes);
    assertThat(result.mimeType()).isEqualTo("audio/webm");
    assertThat(result.objectVersion()).isEqualTo("version-1");
    verify(client).headObject(any(HeadObjectRequest.class));
    verify(client)
        .getObjectAsBytes(any(software.amazon.awssdk.services.s3.model.GetObjectRequest.class));

    when(client.headObject(any(HeadObjectRequest.class)))
        .thenReturn(HeadObjectResponse.builder().contentLength(3L).versionId("version-2").build());

    assertThatThrownBy(() -> storage.read("speaking/a.webm", "version-1"))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("different audio object version");
  }

  private Properties properties() {
    return new Properties(
        "s3",
        "heymimic-test",
        "ap-southeast-1",
        null,
        false,
        Duration.ofSeconds(2),
        Duration.ofMinutes(10),
        Duration.ofMinutes(1),
        20L * 1024 * 1024,
        "ffprobe",
        Duration.ofSeconds(2));
  }
}
