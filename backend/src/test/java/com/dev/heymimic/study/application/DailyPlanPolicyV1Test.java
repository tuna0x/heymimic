package com.dev.heymimic.study.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.dev.heymimic.progress.application.publicapi.MistakePatternView;
import com.dev.heymimic.progress.domain.MistakeStatus;
import com.dev.heymimic.speaking.application.publicapi.SpeakingTopicContentView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingTopicView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordView;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DailyPlanPolicyV1Test {
  private static final UUID WORD_ID = UUID.fromString("00000000-0000-0000-0000-000000000101");
  private static final UUID TOPIC_ID = UUID.fromString("00000000-0000-0000-0000-000000000102");
  private static final UUID MISTAKE_ID = UUID.fromString("00000000-0000-0000-0000-000000000103");
  private static final Instant DUE = Instant.parse("2026-09-08T08:00:00Z");

  @Test
  void prioritizesOverdueWordsAndUsesRemainingBudgetForSpeaking() {
    var drafts = DailyPlanPolicyV1.compose(10, List.of(word()), List.of(), List.of(topic()));

    assertThat(drafts).hasSize(2);
    assertThat(drafts.get(0).kind()).isEqualTo("VOCABULARY");
    assertThat(drafts.get(0).practiceMode()).isEqualTo("OVERDUE_REVIEW");
    assertThat(drafts.get(0).reason().code()).isEqualTo("OVERDUE_WORDS");
    assertThat(drafts.get(1).kind()).isEqualTo("SPEAKING");
    assertThat(drafts.get(1).estimatedSeconds()).isLessThanOrEqualTo(600);
  }

  @Test
  void marksSpeakingAsRemediationOnlyWhenAnActiveMistakeExists() {
    var drafts = DailyPlanPolicyV1.compose(5, List.of(), List.of(mistake()), List.of(topic()));

    assertThat(drafts)
        .singleElement()
        .satisfies(
            draft -> {
              assertThat(draft.kind()).isEqualTo("SPEAKING");
              assertThat(draft.practiceMode()).isEqualTo("MISTAKE_REMEDIATION");
              assertThat(draft.reason().code()).isEqualTo("RECURRING_PATTERN");
              assertThat(draft.reason().evidenceRefs())
                  .containsExactly(MISTAKE_ID.toString(), TOPIC_ID.toString());
            });
  }

  private VocabularyWordView word() {
    return new VocabularyWordView(
        WORD_ID, "en", "word", "meaning", null, null, null, null, null, 0, "new", 1, DUE, 1, DUE);
  }

  private MistakePatternView mistake() {
    return new MistakePatternView(
        MISTAKE_ID,
        "grammar",
        "past-tense",
        "v1",
        "Past tense",
        "Use the past form",
        MistakeStatus.ACTIVE,
        "notPracticed",
        2,
        1,
        DUE,
        DUE);
  }

  private SpeakingTopicView topic() {
    return new SpeakingTopicView(
        TOPIC_ID,
        "Daily routine",
        "casual",
        "Casual",
        "A2-B1",
        "Talk about your day",
        new SpeakingTopicContentView(
            "Daily routine", "I usually", List.of("morning"), List.of(), "I wake up early"),
        1);
  }
}
