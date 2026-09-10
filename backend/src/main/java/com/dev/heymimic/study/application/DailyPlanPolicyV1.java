package com.dev.heymimic.study.application;

import com.dev.heymimic.progress.application.publicapi.MistakePatternView;
import com.dev.heymimic.speaking.application.publicapi.SpeakingTopicView;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWordView;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Deterministic, rule-only composition. It never infers mastery from missing evidence. */
public final class DailyPlanPolicyV1 {
  private DailyPlanPolicyV1() {}

  public static List<PlanDraft> compose(
      int goalMinutes,
      List<VocabularyWordView> overdue,
      List<MistakePatternView> activeMistakes,
      List<SpeakingTopicView> topics) {
    int remaining = goalMinutes * 60;
    List<PlanDraft> drafts = new ArrayList<>();
    List<VocabularyWordView> words =
        overdue.stream()
            .sorted(
                Comparator.comparing(
                        VocabularyWordView::nextReviewAt,
                        Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(VocabularyWordView::id))
            .limit(50)
            .toList();
    if (!words.isEmpty()) {
      int seconds = Math.min(remaining, Math.max(120, Math.min(300, words.size() * 30)));
      drafts.add(
          new PlanDraft(
              "VOCABULARY",
              "OVERDUE_REVIEW",
              words.stream().map(VocabularyWordView::id).toList(),
              seconds,
              new ReasonDraft(
                  "OVERDUE_WORDS",
                  Map.of("count", overdue.size()),
                  words.stream().map(word -> word.id().toString()).toList())));
      remaining -= seconds;
    }

    List<SpeakingTopicView> orderedTopics =
        topics.stream().sorted(Comparator.comparing(SpeakingTopicView::id)).limit(1).toList();
    if (!orderedTopics.isEmpty() && remaining >= 120 && drafts.size() < 3) {
      SpeakingTopicView topic = orderedTopics.get(0);
      String code = activeMistakes.isEmpty() ? "GOAL_MATCH" : "RECURRING_PATTERN";
      List<String> evidence =
          activeMistakes.isEmpty()
              ? List.of(topic.id().toString())
              : List.of(activeMistakes.get(0).id().toString(), topic.id().toString());
      drafts.add(
          new PlanDraft(
              "SPEAKING",
              activeMistakes.isEmpty() ? "TOPIC_PRACTICE" : "MISTAKE_REMEDIATION",
              List.of(topic.id()),
              Math.min(remaining, Math.max(120, Math.min(300, remaining))),
              new ReasonDraft(
                  code,
                  activeMistakes.isEmpty()
                      ? Map.of("topicId", topic.id().toString())
                      : Map.of("patternId", activeMistakes.get(0).id().toString()),
                  evidence)));
    }
    if (drafts.isEmpty() && !orderedTopics.isEmpty()) {
      drafts.add(
          new PlanDraft(
              "SPEAKING",
              "INTRO_TOPIC",
              orderedTopics.isEmpty() ? List.of() : List.of(orderedTopics.get(0).id()),
              Math.min(goalMinutes * 60, 120),
              new ReasonDraft("INSUFFICIENT_EVIDENCE", Map.of(), List.of())));
    }
    return List.copyOf(drafts);
  }

  public record PlanDraft(
      String kind,
      String practiceMode,
      List<UUID> targetRefs,
      int estimatedSeconds,
      ReasonDraft reason) {}

  public record ReasonDraft(String code, Map<String, Object> params, List<String> evidenceRefs) {}
}
