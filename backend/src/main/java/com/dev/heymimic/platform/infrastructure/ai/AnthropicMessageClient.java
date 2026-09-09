package com.dev.heymimic.platform.infrastructure.ai;

import com.dev.heymimic.platform.application.publicapi.ProviderUsage;
import com.dev.heymimic.platform.infrastructure.config.AnthropicConfiguration.Properties;
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

public final class AnthropicMessageClient {
  private static final String ANTHROPIC_VERSION = "2023-06-01";

  private final RestClient client;
  private final Properties properties;
  private final ObjectMapper objectMapper;

  private AnthropicMessageClient(
      RestClient client, Properties properties, ObjectMapper objectMapper) {
    this.client = client;
    this.properties = properties;
    this.objectMapper = objectMapper;
  }

  public static AnthropicMessageClient create(Properties properties, ObjectMapper objectMapper) {
    var requestFactory =
        new JdkClientHttpRequestFactory(
            HttpClient.newBuilder().connectTimeout(properties.requestTimeout()).build());
    requestFactory.setReadTimeout(properties.requestTimeout());
    RestClient client =
        RestClient.builder()
            .requestFactory(requestFactory)
            .baseUrl(properties.apiBaseUrl())
            .defaultHeader("x-api-key", properties.apiKey())
            .defaultHeader("anthropic-version", ANTHROPIC_VERSION)
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            .build();
    return new AnthropicMessageClient(client, properties, objectMapper);
  }

  public Completion complete(String systemPrompt, String userPrompt) {
    String requestBody;
    try {
      requestBody =
          objectMapper.writeValueAsString(
              new AnthropicRequest(
                  properties.model(),
                  properties.maxOutputTokens(),
                  systemPrompt,
                  List.of(new AnthropicMessage("user", userPrompt))));
    } catch (JacksonException exception) {
      throw new AnthropicProviderException(
          AnthropicFailure.REQUEST_REJECTED,
          "Anthropic request could not be serialized",
          exception);
    }

    String responseBody;
    try {
      responseBody =
          client
              .post()
              .uri("/v1/messages")
              .contentType(MediaType.APPLICATION_JSON)
              .body(requestBody)
              .retrieve()
              .body(String.class);
    } catch (RestClientResponseException exception) {
      throw mapResponseFailure(exception);
    } catch (RestClientException exception) {
      throw new AnthropicProviderException(
          networkFailure(exception), "Anthropic request could not be completed", exception);
    }

    try {
      return extractCompletion(responseBody);
    } catch (JacksonException | IllegalArgumentException exception) {
      throw new AnthropicProviderException(
          AnthropicFailure.REQUEST_REJECTED, "Anthropic returned an invalid response", exception);
    }
  }

  private AnthropicFailure networkFailure(Throwable exception) {
    for (Throwable current = exception; current != null; current = current.getCause()) {
      if (current instanceof HttpTimeoutException
          || current instanceof SocketTimeoutException
          || current instanceof TimeoutException) {
        return AnthropicFailure.TIMEOUT;
      }
    }
    return AnthropicFailure.UNAVAILABLE;
  }

  private Completion extractCompletion(String responseBody) throws JacksonException {
    if (responseBody == null || responseBody.isBlank()) {
      throw new IllegalArgumentException("Empty Anthropic response");
    }
    Object parsed = objectMapper.readValue(responseBody, Map.class);
    Map<?, ?> root = object(parsed);
    Object content = root.get("content");
    if (!(content instanceof List<?> blocks) || blocks.isEmpty()) {
      throw new IllegalArgumentException("Anthropic response has no content");
    }
    String text = null;
    for (Object block : blocks) {
      if (block instanceof Map<?, ?> values
          && "text".equals(values.get("type"))
          && values.get("text") instanceof String blockText
          && !blockText.isBlank()) {
        text = blockText.trim();
        break;
      }
    }
    if (text == null) throw new IllegalArgumentException("Anthropic response has no text block");

    Map<?, ?> usage = root.get("usage") instanceof Map<?, ?> values ? values : Map.of();
    return new Completion(
        text,
        new ProviderUsage(
            stringValue(root.get("id")),
            nonNegativeLong(usage.get("input_tokens")),
            nonNegativeLong(usage.get("output_tokens")),
            null,
            null));
  }

  private String stringValue(Object value) {
    return value instanceof String text && !text.isBlank() ? text.trim() : null;
  }

  private Long nonNegativeLong(Object value) {
    if (!(value instanceof Number number)) return null;
    long result = number.longValue();
    return result < 0 ? null : result;
  }

  private Map<?, ?> object(Object value) {
    if (!(value instanceof Map<?, ?> map)) {
      throw new IllegalArgumentException("Anthropic response is not an object");
    }
    return map;
  }

  private AnthropicProviderException mapResponseFailure(RestClientResponseException exception) {
    int status = exception.getStatusCode().value();
    AnthropicFailure failure =
        status == 401 || status == 403
            ? AnthropicFailure.AUTHENTICATION_FAILED
            : status == 429
                ? AnthropicFailure.RATE_LIMITED
                : status >= 500 ? AnthropicFailure.UNAVAILABLE : AnthropicFailure.REQUEST_REJECTED;
    return new AnthropicProviderException(
        failure, "Anthropic provider rejected or could not process the request", exception);
  }

  public record Completion(String text, ProviderUsage usage) {
    public Completion {
      if (text == null || text.isBlank()) throw new IllegalArgumentException("text is required");
      if (usage == null) usage = ProviderUsage.unknown();
    }
  }

  private record AnthropicRequest(
      String model, int max_tokens, String system, List<AnthropicMessage> messages) {}

  private record AnthropicMessage(String role, String content) {}
}
