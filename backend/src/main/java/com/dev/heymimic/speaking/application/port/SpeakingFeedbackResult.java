package com.dev.heymimic.speaking.application.port;

import com.dev.heymimic.platform.application.publicapi.ProviderUsage;
import java.util.List;

public record SpeakingFeedbackResult(
    String source,
    Integer overallScore,
    Integer wordsPerMinute,
    List<String> strengths,
    List<SpeakingFeedbackItem> corrections,
    String provider,
    String model,
    String promptVersion,
    String rubricVersion,
    ProviderUsage usage) {

  public SpeakingFeedbackResult {
    if (usage == null) usage = ProviderUsage.unknown();
  }

  public SpeakingFeedbackResult(
      String source,
      Integer overallScore,
      Integer wordsPerMinute,
      List<String> strengths,
      List<SpeakingFeedbackItem> corrections,
      String provider,
      String model,
      String promptVersion,
      String rubricVersion) {
    this(
        source,
        overallScore,
        wordsPerMinute,
        strengths,
        corrections,
        provider,
        model,
        promptVersion,
        rubricVersion,
        ProviderUsage.unknown());
  }
}
