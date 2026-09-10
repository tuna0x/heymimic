package com.dev.heymimic.speaking.infrastructure.provider;

import com.dev.heymimic.platform.application.publicapi.ProviderUsage;
import com.dev.heymimic.speaking.application.port.AudioObjectBytes;
import com.dev.heymimic.speaking.application.port.AudioObjectStorage;
import com.dev.heymimic.speaking.application.port.SpeakingProviderException;
import com.dev.heymimic.speaking.application.port.SpeakingProviderFailure;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionPort;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionRequest;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionResult;
import com.dev.heymimic.speaking.infrastructure.config.DeepgramConfiguration.Properties;
import java.net.SocketTimeoutException;
import java.net.http.HttpClient;
import java.net.http.HttpTimeoutException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

public final class DeepgramTranscriptionAdapter implements SpeakingTranscriptionPort {
  private final RestClient client;
  private final AudioObjectStorage storage;
  private final ObjectMapper objectMapper;
  private final Properties properties;

  private DeepgramTranscriptionAdapter(
      RestClient client,
      AudioObjectStorage storage,
      ObjectMapper objectMapper,
      Properties properties) {
    this.client = client;
    this.storage = storage;
    this.objectMapper = objectMapper;
    this.properties = properties;
  }

  public static DeepgramTranscriptionAdapter create(
      Properties properties, AudioObjectStorage storage, ObjectMapper objectMapper) {
    var requestFactory =
        new JdkClientHttpRequestFactory(
            HttpClient.newBuilder().connectTimeout(properties.requestTimeout()).build());
    requestFactory.setReadTimeout(properties.requestTimeout());
    RestClient client =
        RestClient.builder()
            .requestFactory(requestFactory)
            .baseUrl(properties.apiBaseUrl())
            .defaultHeader("Authorization", "Token " + properties.apiKey())
            .build();
    return new DeepgramTranscriptionAdapter(client, storage, objectMapper, properties);
  }

  @Override
  public SpeakingTranscriptionResult transcribe(SpeakingTranscriptionRequest request) {
    AudioObjectBytes audio;
    try {
      audio = storage.read(request.objectKey(), request.objectVersion());
    } catch (RuntimeException exception) {
      throw new SpeakingProviderException(
          SpeakingProviderFailure.UNAVAILABLE,
          "Audio storage could not provide the sealed object",
          exception);
    }
    if (audio == null || audio.content().length == 0) {
      throw new SpeakingProviderException(
          SpeakingProviderFailure.REQUEST_REJECTED, "Audio storage returned an empty object", null);
    }

    String responseBody;
    try {
      responseBody =
          client
              .post()
              .uri(
                  uriBuilder ->
                      uriBuilder
                          .path("/v1/listen")
                          .queryParam("model", properties.model())
                          .queryParam("smart_format", true)
                          .queryParam("punctuate", true)
                          .build())
              .contentType(MediaType.parseMediaType(request.mimeType()))
              .body(audio.content())
              .retrieve()
              .body(String.class);
    } catch (RestClientResponseException exception) {
      throw mapResponseFailure(exception);
    } catch (RestClientException exception) {
      throw new SpeakingProviderException(
          networkFailure(exception),
          "Deepgram transcription request could not be completed",
          exception);
    }

    try {
      DeepgramResponse response = parseResponse(responseBody);
      if (response.transcript().isBlank() || response.transcript().length() > 20_000) {
        throw new IllegalArgumentException("Transcript is empty or too long");
      }
      return new SpeakingTranscriptionResult(
          "provider", response.transcript(), "deepgram", properties.model(), response.usage());
    } catch (JacksonException | IllegalArgumentException exception) {
      throw new SpeakingProviderException(
          SpeakingProviderFailure.REQUEST_REJECTED,
          "Deepgram returned invalid transcription",
          exception);
    }
  }

  private DeepgramResponse parseResponse(String responseBody) throws JacksonException {
    if (responseBody == null || responseBody.isBlank()) {
      throw new IllegalArgumentException("Empty Deepgram response");
    }
    Object parsed = objectMapper.readValue(responseBody, Map.class);
    Map<?, ?> root = object(parsed);
    Map<?, ?> results = object(root.get("results"));
    List<?> channels = list(results.get("channels"));
    if (channels.isEmpty()) throw new IllegalArgumentException("No transcription channels");
    Map<?, ?> channel = object(channels.get(0));
    List<?> alternatives = list(channel.get("alternatives"));
    if (alternatives.isEmpty()) throw new IllegalArgumentException("No transcription alternatives");

    String transcript = required(object(alternatives.get(0)).get("transcript"));
    Map<?, ?> metadata = root.get("metadata") instanceof Map<?, ?> values ? values : Map.of();
    Double durationSeconds = decimal(metadata.get("duration"));
    Long audioMilliseconds =
        durationSeconds == null ? null : Math.round(durationSeconds.doubleValue() * 1_000);
    return new DeepgramResponse(
        transcript,
        new ProviderUsage(
            stringValue(metadata.get("request_id")), null, null, audioMilliseconds, null));
  }

  private String required(Object value) {
    if (!(value instanceof String text)) {
      throw new IllegalArgumentException("Transcript is not text");
    }
    return text.trim();
  }

  private String stringValue(Object value) {
    return value instanceof String text && !text.isBlank() ? text.trim() : null;
  }

  private Double decimal(Object value) {
    if (!(value instanceof Number number)) return null;
    double result = number.doubleValue();
    return Double.isFinite(result) && result >= 0 ? result : null;
  }

  private List<?> list(Object value) {
    if (!(value instanceof List<?> list)) {
      throw new IllegalArgumentException("Expected a JSON array");
    }
    return list;
  }

  private Map<?, ?> object(Object value) {
    if (!(value instanceof Map<?, ?> map)) {
      throw new IllegalArgumentException("Expected a JSON object");
    }
    return map;
  }

  private SpeakingProviderException mapResponseFailure(RestClientResponseException exception) {
    int status = exception.getStatusCode().value();
    SpeakingProviderFailure failure =
        status == 401 || status == 403
            ? SpeakingProviderFailure.AUTHENTICATION_FAILED
            : status == 429
                ? SpeakingProviderFailure.RATE_LIMITED
                : status >= 500
                    ? SpeakingProviderFailure.UNAVAILABLE
                    : SpeakingProviderFailure.REQUEST_REJECTED;
    return new SpeakingProviderException(
        failure, "Deepgram transcription provider rejected the request", exception);
  }

  private SpeakingProviderFailure networkFailure(Throwable exception) {
    for (Throwable current = exception; current != null; current = current.getCause()) {
      if (current instanceof HttpTimeoutException
          || current instanceof SocketTimeoutException
          || current instanceof TimeoutException) {
        return SpeakingProviderFailure.TIMEOUT;
      }
    }
    return SpeakingProviderFailure.UNAVAILABLE;
  }

  private record DeepgramResponse(String transcript, ProviderUsage usage) {}
}
