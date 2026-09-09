package com.dev.heymimic.speaking.application.publicapi;

import com.dev.heymimic.speaking.application.port.SpeakingFeedbackResult;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionResult;
import java.util.Optional;
import java.util.UUID;

public interface SpeakingEvaluationWorkflow {
  String JOB_TYPE = "SPEAKING_EVALUATION";

  Optional<PreparedSpeakingEvaluation> prepare(UUID evaluationId, UUID userId);

  Optional<PreparedSpeakingEvaluation> saveTranscript(
      PreparedSpeakingEvaluation evaluation, SpeakingTranscriptionResult result);

  void complete(PreparedSpeakingEvaluation evaluation, SpeakingFeedbackResult result);

  void failFinal(UUID evaluationId, UUID userId, String errorCode);
}
