package com.dev.heymimic.speaking.infrastructure.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dev.heymimic.platform.infrastructure.config.AnthropicConfiguration.Properties;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackRequest;
import com.dev.heymimic.speaking.application.port.SpeakingProviderException;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class ClaudeSpeakingFeedbackAdapterTest {
  private HttpServer server;
  private AtomicReference<String> requestBody;
  private AtomicReference<String> apiKey;
  private int status;
  private String responseText;

  @BeforeEach
  void setUp() throws Exception {
    requestBody = new AtomicReference<>();
    apiKey = new AtomicReference<>();
    status = 200;
    responseText =
        """
        {"overallScore":84,"wordsPerMinute":126,"strengths":["Clear answer"],"corrections":[{"category":"EXPRESSION","originalText":"I do exercise","improvedText":"I exercise","note":"Use the more natural verb form","patternKey":"expression.verb-form"}]}
        """;
    server = HttpServer.create(new InetSocketAddress(0), 0);
    server.createContext(
        "/v1/messages",
        exchange -> {
          requestBody.set(
              new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
          apiKey.set(exchange.getRequestHeaders().getFirst("x-api-key"));
          byte[] body =
              ("{\"id\":\"msg-feedback-42\",\"usage\":{\"input_tokens\":111,\"output_tokens\":37},\"content\":[{\"type\":\"text\",\"text\":"
                      + new ObjectMapper().writeValueAsString(responseText)
                      + "}]}")
                  .getBytes(StandardCharsets.UTF_8);
          exchange.getResponseHeaders().add("Content-Type", "application/json");
          exchange.sendResponseHeaders(status, body.length);
          exchange.getResponseBody().write(body);
          exchange.close();
        });
    server.start();
  }

  @AfterEach
  void tearDown() {
    server.stop(0);
  }

  @Test
  void mapsClaudeJsonIntoSpeakingFeedbackAndSendsRequiredHeaders() {
    var adapter = new ClaudeSpeakingFeedbackAdapter(client(), new ObjectMapper(), properties());

    var result =
        adapter.evaluate(
            new SpeakingFeedbackRequest(
                "I do exercise every morning.", "{\"title\":\"Morning routine\"}", 12_000));

    assertThat(result.source()).isEqualTo("provider");
    assertThat(result.overallScore()).isEqualTo(84);
    assertThat(result.corrections()).hasSize(1);
    assertThat(result.corrections().get(0).category()).isEqualTo("EXPRESSION");
    assertThat(result.usage().requestId()).isEqualTo("msg-feedback-42");
    assertThat(result.usage().inputTokens()).isEqualTo(111L);
    assertThat(result.usage().outputTokens()).isEqualTo(37L);
    assertThat(apiKey).hasValue("test-key");
    assertThat(requestBody)
        .hasValueSatisfying(
            body -> {
              assertThat(body).contains("\"model\":\"test-model\"");
              assertThat(body).contains("\"max_tokens\":512");
              assertThat(body).contains("\"role\":\"user\"");
              assertThat(body).contains("Morning routine");
            });
  }

  @Test
  void mapsRateLimitToRetryableSpeakingFailure() {
    status = 429;
    var adapter = new ClaudeSpeakingFeedbackAdapter(client(), new ObjectMapper(), properties());

    assertThatThrownBy(() -> adapter.evaluate(new SpeakingFeedbackRequest("Hello", "{}", 1_000)))
        .isInstanceOf(SpeakingProviderException.class)
        .hasFieldOrPropertyWithValue(
            "failure",
            com.dev.heymimic.speaking.application.port.SpeakingProviderFailure.RATE_LIMITED);
  }

  private com.dev.heymimic.platform.infrastructure.ai.AnthropicMessageClient client() {
    return com.dev.heymimic.platform.infrastructure.ai.AnthropicMessageClient.create(
        properties(), new ObjectMapper());
  }

  private Properties properties() {
    return new Properties(
        "anthropic",
        "test-key",
        "test-model",
        "http://localhost:" + server.getAddress().getPort(),
        Duration.ofSeconds(2),
        512,
        "speaking-feedback-test-v1",
        "general-speaking-test-v1");
  }
}
