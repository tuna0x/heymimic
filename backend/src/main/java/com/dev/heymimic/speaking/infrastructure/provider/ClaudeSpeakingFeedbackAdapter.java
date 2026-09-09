package com.dev.heymimic.speaking.infrastructure.provider;

import com.dev.heymimic.platform.infrastructure.ai.AnthropicMessageClient;
import com.dev.heymimic.platform.infrastructure.ai.AnthropicProviderException;
import com.dev.heymimic.platform.infrastructure.config.AnthropicConfiguration.Properties;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackItem;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackPort;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackRequest;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackResult;
import com.dev.heymimic.speaking.application.port.SpeakingProviderException;
import com.dev.heymimic.speaking.application.port.SpeakingProviderFailure;
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
public final class ClaudeSpeakingFeedbackAdapter implements SpeakingFeedbackPort {
  private static final String SYSTEM_PROMPT =
      """
      You are the HeyMimic speaking coach. Evaluate a learner's English speaking response.
      Return one JSON object only, with no markdown and no extra keys.
      The object must contain overallScore (integer 0-100), wordsPerMinute (integer or null),
      strengths (array of at most 3 short strings), and corrections (array of at most 10 objects).
      Each correction must contain category (GRAMMAR, VOCABULARY, or EXPRESSION),
      originalText (string or null), improvedText (string or null), note (short string),
      and patternKey (string or null). Never include personal data or invented quotes.
      """;

  private final AnthropicMessageClient client;
  private final ObjectMapper objectMapper;
  private final Properties properties;

  public ClaudeSpeakingFeedbackAdapter(
      AnthropicMessageClient client, ObjectMapper objectMapper, Properties properties) {
    this.client = client;
    this.objectMapper = objectMapper;
    this.properties = properties;
  }

  @Override
  public SpeakingFeedbackResult evaluate(SpeakingFeedbackRequest request) {
    AnthropicMessageClient.Completion completion;
    try {
      completion =
          client.complete(
              SYSTEM_PROMPT,
              """
              Evaluate the following response. Use the prompt snapshot only as context for the
              expected task. Return JSON only.

              <prompt_snapshot>
              %s
              </prompt_snapshot>
              <transcript>
              %s
              </transcript>
              <duration_ms>%d</duration_ms>
              """
                  .formatted(
                      request.promptSnapshotJson(), request.transcript(), request.durationMs()));
    } catch (AnthropicProviderException exception) {
      throw mapFailure(exception);
    }

    try {
      String raw = completion.text();
      Map<?, ?> root = object(objectMapper.readValue(stripCodeFence(raw), Map.class));
      Integer overallScore = integer(root.get("overallScore"), "overallScore");
      Integer wordsPerMinute = optionalInteger(root.get("wordsPerMinute"), "wordsPerMinute");
      List<String> strengths = strings(root.get("strengths"), "strengths", 3);
      List<SpeakingFeedbackItem> corrections = corrections(root.get("corrections"));
      if (overallScore < 0 || overallScore > 100) {
        throw new IllegalArgumentException("overallScore out of range");
      }
      if (wordsPerMinute != null && (wordsPerMinute < 0 || wordsPerMinute > 400)) {
        throw new IllegalArgumentException("wordsPerMinute out of range");
      }
      return new SpeakingFeedbackResult(
          "provider",
          overallScore,
          wordsPerMinute,
          strengths,
          corrections,
          "anthropic",
          properties.model(),
          properties.promptVersion(),
          properties.rubricVersion(),
          completion.usage());
    } catch (JacksonException | IllegalArgumentException exception) {
      throw new SpeakingProviderException(
          SpeakingProviderFailure.REQUEST_REJECTED,
          "Anthropic returned invalid speaking feedback",
          exception);
    }
  }

  private List<SpeakingFeedbackItem> corrections(Object value) {
    if (!(value instanceof List<?> list) || list.size() > 10) {
      throw new IllegalArgumentException("corrections must contain at most 10 items");
    }
    List<SpeakingFeedbackItem> result = new ArrayList<>();
    for (Object item : list) {
      if (!(item instanceof Map<?, ?> values)) {
        throw new IllegalArgumentException("correction is not an object");
      }
      String category = required(values.get("category"), "category");
      if (!List.of("GRAMMAR", "VOCABULARY", "EXPRESSION").contains(category)) {
        throw new IllegalArgumentException("correction category is invalid");
      }
      result.add(
          new SpeakingFeedbackItem(
              category,
              optional(values.get("originalText")),
              optional(values.get("improvedText")),
              required(values.get("note"), "note"),
              optional(values.get("patternKey"))));
    }
    return List.copyOf(result);
  }

  private List<String> strings(Object value, String field, int maxItems) {
    if (!(value instanceof List<?> list) || list.size() > maxItems) {
      throw new IllegalArgumentException(field + " must contain at most " + maxItems + " items");
    }
    return list.stream().map(item -> required(item, field)).toList();
  }

  private Integer integer(Object value, String field) {
    if (!(value instanceof Number number)) {
      throw new IllegalArgumentException(field + " must be an integer");
    }
    return number.intValue();
  }

  private Integer optionalInteger(Object value, String field) {
    if (value == null) return null;
    return integer(value, field);
  }

  private String required(Object value, String field) {
    if (!(value instanceof String text) || text.isBlank() || text.length() > 2_000) {
      throw new IllegalArgumentException(field + " is invalid");
    }
    return text.trim();
  }

  private String optional(Object value) {
    if (value == null) return null;
    if (!(value instanceof String text) || text.length() > 2_000) {
      throw new IllegalArgumentException("Optional feedback text is invalid");
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

  private SpeakingProviderException mapFailure(AnthropicProviderException exception) {
    SpeakingProviderFailure failure =
        switch (exception.failure()) {
          case TIMEOUT -> SpeakingProviderFailure.TIMEOUT;
          case RATE_LIMITED -> SpeakingProviderFailure.RATE_LIMITED;
          case UNAVAILABLE -> SpeakingProviderFailure.UNAVAILABLE;
          case AUTHENTICATION_FAILED -> SpeakingProviderFailure.AUTHENTICATION_FAILED;
          case REQUEST_REJECTED -> SpeakingProviderFailure.REQUEST_REJECTED;
        };
    return new SpeakingProviderException(
        failure, "Anthropic speaking feedback request failed", exception);
  }
}
