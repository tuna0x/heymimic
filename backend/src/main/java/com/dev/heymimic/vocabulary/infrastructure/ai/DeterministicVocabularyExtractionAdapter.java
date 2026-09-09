package com.dev.heymimic.vocabulary.infrastructure.ai;

import com.dev.heymimic.vocabulary.application.port.ExtractedVocabularySuggestion;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionPort;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionResult;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "heymimic.vocabulary",
    name = "fake-extraction",
    havingValue = "true")
public class DeterministicVocabularyExtractionAdapter implements VocabularyExtractionPort {
  private static final Pattern TOKEN = Pattern.compile("[\\p{L}][\\p{L}'-]{3,}");
  private static final Set<String> STOP_WORDS =
      Set.of("this", "that", "with", "from", "have", "your", "they", "will", "would", "about");

  @Override
  public VocabularyExtractionResult extract(String text, String targetLanguage) {
    var words = new LinkedHashSet<String>();
    var matcher = TOKEN.matcher(text);
    while (matcher.find() && words.size() < 5) {
      String word = matcher.group().toLowerCase(Locale.ROOT);
      if (!STOP_WORDS.contains(word)) words.add(word);
    }
    String source = text.length() <= 500 ? text : text.substring(0, 500);
    return new VocabularyExtractionResult(
        "fake",
        words.stream()
            .map(
                word ->
                    new ExtractedVocabularySuggestion(
                        word,
                        "Deterministic development meaning for " + word,
                        null,
                        null,
                        source,
                        null,
                        source))
            .toList());
  }
}
