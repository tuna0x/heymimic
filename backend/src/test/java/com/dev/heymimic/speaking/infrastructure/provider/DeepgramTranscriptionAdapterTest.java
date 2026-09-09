package com.dev.heymimic.speaking.infrastructure.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.dev.heymimic.speaking.application.port.AudioObjectBytes;
import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.application.port.SpeakingProviderException;
import com.dev.heymimic.speaking.application.port.SpeakingProviderFailure;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionRequest;
import com.dev.heymimic.speaking.infrastructure.config.DeepgramConfiguration.Properties;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class DeepgramTranscriptionAdapterTest {
  private HttpServer server;
  private AtomicReference<String> authorization;
  private AtomicReference<String> requestBody;
  private AtomicReference<String> contentType;
  private int status;

  @BeforeEach
  void setUp() throws Exception {
    authorization = new AtomicReference<>();
    requestBody = new AtomicReference<>();
    contentType = new AtomicReference<>();
    status = 200;
    server = HttpServer.create(new InetSocketAddress(0), 0);
    server.createContext(
        "/v1/listen",
        exchange -> {
          authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
          contentType.set(exchange.getRequestHeaders().getFirst("Content-Type"));
          requestBody.set(
              new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
          byte[] body =
              """
              {"metadata":{"request_id":"dg-request-42","duration":3.25},"results":{"channels":[{"alternatives":[{"transcript":"I explain the release plan clearly."}]}]}}
              """
                  .getBytes(StandardCharsets.UTF_8);
          exchange.getResponseHeaders().add("Content-Type", "application/json");
          exchange.sendResponseHeaders(status, status == 200 ? body.length : -1);
          if (status == 200) exchange.getResponseBody().write(body);
          exchange.close();
        });
    server.start();
  }

  @AfterEach
  void tearDown() {
    server.stop(0);
  }

  @Test
  void readsSealedAudioAndMapsDeepgramTranscript() {
    AudioObjectStorage storage = mock(AudioObjectStorage.class);
    when(storage.read("speaking/a.webm", "version-1"))
        .thenReturn(
            new AudioObjectBytes(
                "audio fixture bytes".getBytes(StandardCharsets.UTF_8), "audio/webm", "version-1"));
    var adapter = DeepgramTranscriptionAdapter.create(properties(), storage, new ObjectMapper());

    var result =
        adapter.transcribe(
            new SpeakingTranscriptionRequest("speaking/a.webm", "version-1", "audio/webm", 3_000));

    assertThat(result)
        .isEqualTo(
            new com.dev.heymimic.speaking.application.port.SpeakingTranscriptionResult(
                "provider",
                "I explain the release plan clearly.",
                "deepgram",
                "nova-3",
                new com.dev.heymimic.platform.application.publicapi.ProviderUsage(
                    "dg-request-42", null, null, 3_250L, null)));
    assertThat(authorization).hasValue("Token test-key");
    assertThat(contentType).hasValue("audio/webm");
    assertThat(requestBody).hasValue("audio fixture bytes");
  }

  @Test
  void mapsDeepgramRateLimitToRetryableFailure() {
    status = 429;
    AudioObjectStorage storage = mock(AudioObjectStorage.class);
    when(storage.read("speaking/a.webm", "version-1"))
        .thenReturn(new AudioObjectBytes(new byte[] {1}, "audio/webm", "version-1"));
    var adapter = DeepgramTranscriptionAdapter.create(properties(), storage, new ObjectMapper());

    assertThatThrownBy(
            () ->
                adapter.transcribe(
                    new SpeakingTranscriptionRequest(
                        "speaking/a.webm", "version-1", "audio/webm", 3_000)))
        .isInstanceOf(SpeakingProviderException.class)
        .hasFieldOrPropertyWithValue("failure", SpeakingProviderFailure.RATE_LIMITED);
  }

  private Properties properties() {
    return new Properties(
        "deepgram",
        "test-key",
        "nova-3",
        "http://localhost:" + server.getAddress().getPort(),
        Duration.ofSeconds(2));
  }
}
