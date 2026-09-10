package com.dev.heymimic.speaking.application.publicapi;

/** Maps onboarding self-assessment to the topic catalog's supported bands. */
public final class PracticeLevelResolver {
  private PracticeLevelResolver() {}

  public static String topicLevel(String selfAssessedLevel) {
    if (selfAssessedLevel == null) return "A2-B1";
    return switch (selfAssessedLevel) {
      case "intermediate" -> "B1-B2";
      case "A2-B1", "B1-B2", "B2+" -> selfAssessedLevel;
      default -> "A2-B1";
    };
  }
}
