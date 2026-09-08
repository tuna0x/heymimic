package com.dev.heymimic.speaking.application.port;

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
    String rubricVersion) {}
