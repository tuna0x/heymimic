package com.dev.heymimic.speaking.infrastructure.worker;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetManager;
import com.dev.heymimic.platform.application.publicapi.ProviderCallStatus;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageRecorder;
import com.dev.heymimic.platform.application.publicapi.RetryableJobException;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackPort;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackResult;
import com.dev.heymimic.speaking.application.port.SpeakingProviderException;
import com.dev.heymimic.speaking.application.port.SpeakingProviderFailure;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionPort;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionResult;
import com.dev.heymimic.speaking.application.publicapi.PreparedSpeakingEvaluation;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluationWorkflow;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStage;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class SpeakingEvaluationJobHandlerTest {
  private final SpeakingEvaluationWorkflow workflow = mock(SpeakingEvaluationWorkflow.class);
  private final SpeakingTranscriptionPort transcription = mock(SpeakingTranscriptionPort.class);
  private final SpeakingFeedbackPort feedback = mock(SpeakingFeedbackPort.class);
  private final ProviderUsageRecorder usageRecorder = mock(ProviderUsageRecorder.class);
  private final ProviderBudgetManager budgetManager = mock(ProviderBudgetManager.class);
  private final SpeakingEvaluationJobHandler handler =
      new SpeakingEvaluationJobHandler(
          workflow,
          transcription,
          feedback,
          usageRecorder,
          budgetManager,
          com.dev.heymimic.support.TestJobFences.direct());

  @Test
  void checkpointsTranscriptBeforeCallingFeedback() {
    ClaimedJob job = job();
    PreparedSpeakingEvaluation transcribing = prepared(SpeakingEvaluationStage.TRANSCRIBING, null);
    PreparedSpeakingEvaluation checkpoint =
        prepared(SpeakingEvaluationStage.FEEDBACK, "A persisted transcript");
    var transcript =
        new SpeakingTranscriptionResult("fake", "A persisted transcript", "fake", "v1");
    SpeakingFeedbackResult result = feedbackResult();
    when(workflow.prepare(job.resourceId(), job.ownerUserId()))
        .thenReturn(Optional.of(transcribing));
    when(transcription.transcribe(org.mockito.ArgumentMatchers.any())).thenReturn(transcript);
    when(workflow.saveTranscript(transcribing, transcript)).thenReturn(Optional.of(checkpoint));
    when(feedback.evaluate(org.mockito.ArgumentMatchers.any())).thenReturn(result);

    handler.handle(job);

    verify(workflow).saveTranscript(transcribing, transcript);
    verify(workflow).complete(checkpoint, result);
    verify(budgetManager)
        .reserve(org.mockito.ArgumentMatchers.argThat(command -> command.stage().equals("STT")));
    verify(budgetManager)
        .reserve(
            org.mockito.ArgumentMatchers.argThat(command -> command.stage().equals("FEEDBACK")));
  }

  @Test
  void retryAtFeedbackCheckpointDoesNotCallTranscriptionAgain() {
    ClaimedJob job = job();
    PreparedSpeakingEvaluation checkpoint =
        prepared(SpeakingEvaluationStage.FEEDBACK, "A persisted transcript");
    SpeakingFeedbackResult result = feedbackResult();
    when(workflow.prepare(job.resourceId(), job.ownerUserId())).thenReturn(Optional.of(checkpoint));
    when(feedback.evaluate(org.mockito.ArgumentMatchers.any())).thenReturn(result);

    handler.handle(job);

    verify(transcription, never()).transcribe(org.mockito.ArgumentMatchers.any());
    verify(workflow).complete(checkpoint, result);
  }

  @Test
  void turnsProviderBudgetCapIntoNonRetryableFailureBeforeProviderCall() {
    ClaimedJob job = job();
    PreparedSpeakingEvaluation evaluation = prepared(SpeakingEvaluationStage.TRANSCRIBING, null);
    when(workflow.prepare(job.resourceId(), job.ownerUserId())).thenReturn(Optional.of(evaluation));
    doThrow(new ApiException(HttpStatus.TOO_MANY_REQUESTS, "PROVIDER_BUDGET_EXCEEDED", "cap"))
        .when(budgetManager)
        .reserve(org.mockito.ArgumentMatchers.any());

    assertThatThrownBy(() -> handler.handle(job))
        .isInstanceOfSatisfying(
            NonRetryableJobException.class,
            exception ->
                org.assertj.core.api.Assertions.assertThat(exception.errorCode())
                    .isEqualTo("PROVIDER_BUDGET_EXCEEDED"));
    verify(transcription, never()).transcribe(org.mockito.ArgumentMatchers.any());
    verify(usageRecorder, never()).record(org.mockito.ArgumentMatchers.any());
  }

  @Test
  void mapsTranscriptionTimeoutToStableRetryableError() {
    ClaimedJob job = job();
    PreparedSpeakingEvaluation evaluation = prepared(SpeakingEvaluationStage.TRANSCRIBING, null);
    when(workflow.prepare(job.resourceId(), job.ownerUserId())).thenReturn(Optional.of(evaluation));
    when(transcription.transcribe(org.mockito.ArgumentMatchers.any()))
        .thenThrow(
            new SpeakingProviderException(
                SpeakingProviderFailure.TIMEOUT, "provider timed out", null));

    assertThatThrownBy(() -> handler.handle(job))
        .isInstanceOfSatisfying(
            RetryableJobException.class,
            exception ->
                org.assertj.core.api.Assertions.assertThat(exception.errorCode())
                    .isEqualTo("STT_TIMEOUT"));
  }

  @Test
  void recordsUnknownReceiptWhenProviderTimesOut() {
    ClaimedJob job = job();
    PreparedSpeakingEvaluation evaluation = prepared(SpeakingEvaluationStage.TRANSCRIBING, null);
    when(workflow.prepare(job.resourceId(), job.ownerUserId())).thenReturn(Optional.of(evaluation));
    when(transcription.transcribe(org.mockito.ArgumentMatchers.any()))
        .thenThrow(
            new SpeakingProviderException(
                SpeakingProviderFailure.TIMEOUT, "provider timed out", null));

    assertThatThrownBy(() -> handler.handle(job)).isInstanceOf(RetryableJobException.class);

    verify(usageRecorder)
        .record(
            org.mockito.ArgumentMatchers.argThat(
                receipt ->
                    receipt.operationId().equals(job.id())
                        && receipt.resourceId().equals(evaluation.id())
                        && receipt.stage().equals("STT")
                        && receipt.status() == ProviderCallStatus.UNKNOWN));
  }

  @Test
  void mapsFeedbackAuthenticationFailureToTerminalError() {
    ClaimedJob job = job();
    PreparedSpeakingEvaluation evaluation =
        prepared(SpeakingEvaluationStage.FEEDBACK, "A persisted transcript");
    when(workflow.prepare(job.resourceId(), job.ownerUserId())).thenReturn(Optional.of(evaluation));
    when(feedback.evaluate(org.mockito.ArgumentMatchers.any()))
        .thenThrow(
            new SpeakingProviderException(
                SpeakingProviderFailure.AUTHENTICATION_FAILED, "invalid credentials", null));

    assertThatThrownBy(() -> handler.handle(job))
        .isInstanceOfSatisfying(
            NonRetryableJobException.class,
            exception ->
                org.assertj.core.api.Assertions.assertThat(exception.errorCode())
                    .isEqualTo("FEEDBACK_AUTHENTICATION_FAILED"));
  }

  @Test
  void rejectsInvalidFeedbackWithoutRetryingProvider() {
    ClaimedJob job = job();
    PreparedSpeakingEvaluation evaluation =
        prepared(SpeakingEvaluationStage.FEEDBACK, "A persisted transcript");
    SpeakingFeedbackResult result = feedbackResult();
    when(workflow.prepare(job.resourceId(), job.ownerUserId())).thenReturn(Optional.of(evaluation));
    when(feedback.evaluate(org.mockito.ArgumentMatchers.any())).thenReturn(result);
    org.mockito.Mockito.doThrow(new IllegalArgumentException("invalid schema"))
        .when(workflow)
        .complete(evaluation, result);

    assertThatThrownBy(() -> handler.handle(job))
        .isInstanceOfSatisfying(
            NonRetryableJobException.class,
            exception ->
                org.assertj.core.api.Assertions.assertThat(exception.errorCode())
                    .isEqualTo("FEEDBACK_INVALID_RESPONSE"));
  }

  private PreparedSpeakingEvaluation prepared(SpeakingEvaluationStage stage, String transcript) {
    return new PreparedSpeakingEvaluation(
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        UUID.randomUUID(),
        "speaking/object",
        "object-v1",
        "audio/webm",
        12_000,
        "{}",
        stage,
        transcript,
        UUID.randomUUID());
  }

  private SpeakingFeedbackResult feedbackResult() {
    return new SpeakingFeedbackResult(
        "fake", 70, null, List.of("Clear"), List.of(), "fake", "v1", "p1", "r1");
  }

  private ClaimedJob job() {
    return new ClaimedJob(
        UUID.randomUUID(),
        UUID.randomUUID(),
        SpeakingEvaluationWorkflow.JOB_TYPE,
        UUID.randomUUID(),
        1,
        "{}",
        null,
        1,
        1,
        Instant.parse("2026-09-08T03:02:00Z"));
  }
}
