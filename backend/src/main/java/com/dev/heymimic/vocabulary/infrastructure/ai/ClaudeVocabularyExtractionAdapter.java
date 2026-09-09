package com.dev.heymimic.vocabulary.infrastructure.ai;

import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.platform.application.publicapi.RetryableJobException;
import com.dev.heymimic.platform.infrastructure.ai.AnthropicFailure;
import com.dev.heymimic.platform.infrastructure.ai.AnthropicMessageClient;
import com.dev.heymimic.platform.infrastructure.ai.AnthropicProviderException;
import com.dev.heymimic.vocabulary.application.port.ExtractedVocabularySuggestion;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionPort;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionResult;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
@Profile({"prod", "staging"})
@ConditionalOnProperty(prefix = "heymimic.ai", name = "provider", havingValue = "anthropic")
public final class ClaudeVocabularyExtractionAdapter implements VocabularyExtractionPort {
  private static final String SYSTEM_PROMPT =
      """
      You extract useful vocabulary from learner text. Return one JSON object only, with no
      markdown and no extra keys. The object must contain suggestions, an array of at most 20
      objects. Each object must contain word and meaning, and may contain pronunciation,
      partOfSpeech, example, translation, and sourceSentence. Keep every value concise and
      grounded in the supplied text.
      """;

  private final AnthropicMessageClient client;
  private final ObjectMapper objectMapper;

  public ClaudeVocabularyExtractionAdapter(
      AnthropicMessageClient client, ObjectMapper objectMapper) {
    this.client = client;
    this.objectMapper = objectMapper;
  }

  @Override
  public VocabularyExtractionResult extract(String text, String targetLanguage) {
    AnthropicMessageClient.Completion completion;
    try {
      completion =
          client.complete(
              SYSTEM_PROMPT,
              """
              Extract vocabulary suitable for a learner whose target language is "%s".
              <source_text>
              %s
              </source_text>
              """
                  .formatted(targetLanguage, text));
    } catch (AnthropicProviderException exception) {
      throw mapFailure(exception);
    }

    try {
      String raw = completion.text();
      Map<?, ?> root = object(objectMapper.readValue(stripCodeFence(raw), Map.class));
      Object suggestionsValue = root.get("suggestions");
      if (!(suggestionsValue instanceof List<?> list) || list.size() > 20) {
        throw new IllegalArgumentException("suggestions must contain at most 20 items");
      }
      List<ExtractedVocabularySuggestion> suggestions = new ArrayList<>();
      for (Object item : list) {
        if (!(item instanceof Map<?, ?> values)) {
          throw new IllegalArgumentException("suggestion is not an object");
        }
        suggestions.add(
            new ExtractedVocabularySuggestion(
                required(values.get("word"), "word"),
                required(values.get("meaning"), "meaning"),
                optional(values.get("pronunciation"), 200),
                optional(values.get("partOfSpeech"), 50),
                optional(values.get("example"), 2_000),
                optional(values.get("translation"), 2_000),
                optional(values.get("sourceSentence"), 4_000)));
      }
      return new VocabularyExtractionResult(
          "provider", List.copyOf(suggestions), completion.usage());
    } catch (JacksonException | IllegalArgumentException exception) {
      throw new NonRetryableJobException(
          "VOCABULARY_PROVIDER_INVALID_RESPONSE",
          "Anthropic returned invalid vocabulary extraction",
          exception);
    }
  }

  private String required(Object value, String field) {
    if (!(value instanceof String text) || text.isBlank() || text.length() > 2_000) {
      throw new IllegalArgumentException(field + " is invalid");
    }
    return text.trim();
  }

  private String optional(Object value, int maxLength) {
    if (value == null) return null;
    if (!(value instanceof String text) || text.length() > maxLength) {
      throw new IllegalArgumentException("Optional vocabulary field is invalid");
    }
    return text.trim();
  }

  private String stripCodeFence(String value) {
    String normalized = value.trim();
    String fence = String.valueOf((char) 96).repeat(3);
    if (!normalized.startsWith(fence)) return normalized;
    int firstLine = normalized.indexOf('\n');
    int lastFence = normalized.lastIndexOf(fence);
    if (firstLine < 0 || lastFence <= firstLine) return normalized;
    return normalized.substring(firstLine + 1, lastFence).trim();
  }

  private Map<?, ?> object(Object value) {
    if (!(value instanceof Map<?, ?> map)) {
      throw new IllegalArgumentException("JSON object expected");
    }
    return map;
  }

  private RuntimeException mapFailure(AnthropicProviderException exception) {
    if (exception.failure().retryable()) {
      String errorCode =
          exception.failure() == AnthropicFailure.RATE_LIMITED
              ? "VOCABULARY_PROVIDER_RATE_LIMITED"
              : "VOCABULARY_PROVIDER_UNAVAILABLE";
      return new RetryableJobException(
          errorCode, "Anthropic vocabulary request can be retried", exception);
    }
    return new NonRetryableJobException(
        exception.failure() == AnthropicFailure.AUTHENTICATION_FAILED
            ? "VOCABULARY_PROVIDER_AUTHENTICATION_FAILED"
            : "VOCABULARY_PROVIDER_REJECTED",
        "Anthropic vocabulary request was rejected",
        exception);
  }
}
