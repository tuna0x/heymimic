package com.dev.heymimic.speaking.infrastructure.provider;

import com.dev.heymimic.speaking.application.port.SpeakingFeedbackItem;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackPort;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackRequest;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackResult;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionPort;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionRequest;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionResult;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "heymimic.speaking", name = "fake-evaluation", havingValue = "true")
public class DevelopmentSpeakingEvaluationAdapter
    implements SpeakingTranscriptionPort, SpeakingFeedbackPort {
  @Override
  public SpeakingTranscriptionResult transcribe(SpeakingTranscriptionRequest request) {
    return new SpeakingTranscriptionResult(
        "fake",
        "Development fixture transcript. It was not transcribed from the uploaded audio.",
        "development-fixture",
        "deterministic-v1");
  }

  @Override
  public SpeakingFeedbackResult evaluate(SpeakingFeedbackRequest request) {
    return new SpeakingFeedbackResult(
        "fake",
        70,
        null,
        List.of("The response follows a clear development-fixture structure."),
        List.of(
            new SpeakingFeedbackItem(
                "EXPRESSION",
                null,
                null,
                "This is fixture feedback; configure real providers before production.",
                "expression.development-fixture")),
        "development-fixture",
        "deterministic-v1",
        "speaking-feedback-v1",
        "general-speaking-v1");
  }
}
