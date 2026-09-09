package com.dev.heymimic.vocabulary.infrastructure.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dev.heymimic.platform.application.publicapi.RetryableJobException;
import com.dev.heymimic.platform.infrastructure.ai.AnthropicMessageClient;
import com.dev.heymimic.platform.infrastructure.config.AnthropicConfiguration.Properties;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class ClaudeVocabularyExtractionAdapterTest {
  private HttpServer server;
  private AtomicReference<String> requestBody;
  private int status;
  private String responseText;

  @BeforeEach
  void setUp() throws Exception {
    requestBody = new AtomicReference<>();
    status = 200;
    responseText =
        """
        {"suggestions":[{"word":"resilient","meaning":"able to recover quickly","pronunciation":"/rɪˈzɪliənt/","partOfSpeech":"adjective","example":"She stayed resilient after the setback.","translation":"kiên cường","sourceSentence":"She stayed resilient after the setback."}]}
        """;
    server = HttpServer.create(new InetSocketAddress(0), 0);
    server.createContext(
        "/v1/messages",
        exchange -> {
          requestBody.set(
              new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
          byte[] body =
              ("{\"id\":\"msg-extraction-42\",\"usage\":{\"input_tokens\":89,\"output_tokens\":24},\"content\":[{\"type\":\"text\",\"text\":"
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
  void mapsClaudeJsonIntoVocabularySuggestions() {
    var adapter = new ClaudeVocabularyExtractionAdapter(client(), new ObjectMapper());

    var result = adapter.extract("She stayed resilient after the setback.", "en");

    assertThat(result.source()).isEqualTo("provider");
    assertThat(result.usage().requestId()).isEqualTo("msg-extraction-42");
    assertThat(result.usage().inputTokens()).isEqualTo(89L);
    assertThat(result.usage().outputTokens()).isEqualTo(24L);
    assertThat(result.suggestions())
        .singleElement()
        .satisfies(
            suggestion -> {
              assertThat(suggestion.word()).isEqualTo("resilient");
              assertThat(suggestion.meaning()).isEqualTo("able to recover quickly");
              assertThat(suggestion.partOfSpeech()).isEqualTo("adjective");
            });
    assertThat(requestBody)
        .hasValueSatisfying(
            body -> {
              assertThat(body).contains("\"model\":\"test-model\"");
              assertThat(body).contains("target language is");
              assertThat(body).contains("resilient");
            });
  }

  @Test
  void mapsServerFailureToRetryableVocabularyJobFailure() {
    status = 503;
    var adapter = new ClaudeVocabularyExtractionAdapter(client(), new ObjectMapper());

    assertThatThrownBy(() -> adapter.extract("Hello world", "en"))
        .isInstanceOf(RetryableJobException.class)
        .hasFieldOrPropertyWithValue("errorCode", "VOCABULARY_PROVIDER_UNAVAILABLE");
  }

  private AnthropicMessageClient client() {
    return AnthropicMessageClient.create(properties(), new ObjectMapper());
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
