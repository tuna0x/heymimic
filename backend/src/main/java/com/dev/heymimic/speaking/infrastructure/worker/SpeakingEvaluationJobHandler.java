package com.dev.heymimic.speaking.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobExecutionFence;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetManager;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetReservationCommand;
import com.dev.heymimic.platform.application.publicapi.ProviderUsage;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageReceipt;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageRecorder;
import com.dev.heymimic.platform.application.publicapi.RetryableJobException;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackPort;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackRequest;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackResult;
import com.dev.heymimic.speaking.application.port.SpeakingProviderException;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionPort;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionRequest;
import com.dev.heymimic.speaking.application.port.SpeakingTranscriptionResult;
import com.dev.heymimic.speaking.application.publicapi.PreparedSpeakingEvaluation;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluationWorkflow;
import com.dev.heymimic.speaking.domain.SpeakingEvaluationStage;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SpeakingEvaluationJobHandler implements JobHandler {
  private static final Logger log = LoggerFactory.getLogger(SpeakingEvaluationJobHandler.class);
  private static final String OPERATION = "SPEAKING_EVALUATION";

  private final SpeakingEvaluationWorkflow workflow;
  private final SpeakingTranscriptionPort transcription;
  private final SpeakingFeedbackPort feedback;
  private final ProviderUsageRecorder usageRecorder;
  private final ProviderBudgetManager budgetManager;
  private final JobExecutionFence fence;

  @Autowired
  public SpeakingEvaluationJobHandler(
      SpeakingEvaluationWorkflow workflow,
      SpeakingTranscriptionPort transcription,
      SpeakingFeedbackPort feedback,
      ProviderUsageRecorder usageRecorder,
      ProviderBudgetManager budgetManager,
      JobExecutionFence fence) {
    this.workflow = workflow;
    this.transcription = transcription;
    this.feedback = feedback;
    this.usageRecorder = usageRecorder;
    this.budgetManager = budgetManager;
    this.fence = fence;
  }

  @Override
  public String jobType() {
    return SpeakingEvaluationWorkflow.JOB_TYPE;
  }

  @Override
  public void handle(ClaimedJob job) {
    var prepared = fence.execute(job, () -> workflow.prepare(job.resourceId(), job.ownerUserId()));
    if (prepared.isEmpty()) return;
    var evaluation = prepared.orElseThrow();
    if (evaluation.stage() == SpeakingEvaluationStage.TRANSCRIBING) {
      var transcript = transcribe(evaluation, job);
      var checkpoint = saveTranscript(job, evaluation, transcript);
      if (checkpoint.isEmpty()) return;
      evaluation = checkpoint.orElseThrow();
    }
    if (evaluation.stage() == SpeakingEvaluationStage.FEEDBACK) {
      complete(job, evaluation, evaluateFeedback(evaluation, job));
    }
  }

  private SpeakingTranscriptionResult transcribe(
      PreparedSpeakingEvaluation evaluation, ClaimedJob job) {
    fence.run(job, () -> reserveBudget(job, evaluation, "STT"));
    try {
      var result =
          transcription.transcribe(
              new SpeakingTranscriptionRequest(
                  evaluation.objectKey(),
                  evaluation.objectVersion(),
                  evaluation.mimeType(),
                  evaluation.durationMs()));
      recordSuccess(job, evaluation, "STT", result.provider(), result.model(), result.usage());
      return result;
    } catch (SpeakingProviderException exception) {
      recordUnknown(job, evaluation, "STT", "STT_" + exception.failure().name());
      throw providerFailure("STT", exception);
    } catch (RuntimeException exception) {
      recordUnknown(job, evaluation, "STT", "STT_UNEXPECTED");
      throw exception;
    }
  }

  private Optional<PreparedSpeakingEvaluation> saveTranscript(
      ClaimedJob job,
      PreparedSpeakingEvaluation evaluation,
      SpeakingTranscriptionResult transcript) {
    try {
      return fence.execute(job, () -> workflow.saveTranscript(evaluation, transcript));
    } catch (IllegalArgumentException exception) {
      throw new NonRetryableJobException(
          "STT_INVALID_RESPONSE", "Transcription provider returned an invalid response", exception);
    }
  }

  private SpeakingFeedbackResult evaluateFeedback(
      PreparedSpeakingEvaluation evaluation, ClaimedJob job) {
    fence.run(job, () -> reserveBudget(job, evaluation, "FEEDBACK"));
    try {
      var result =
          feedback.evaluate(
              new SpeakingFeedbackRequest(
                  evaluation.transcript(),
                  evaluation.promptSnapshotJson(),
                  evaluation.durationMs()));
      recordSuccess(job, evaluation, "FEEDBACK", result.provider(), result.model(), result.usage());
      return result;
    } catch (SpeakingProviderException exception) {
      recordUnknown(job, evaluation, "FEEDBACK", "FEEDBACK_" + exception.failure().name());
      throw providerFailure("FEEDBACK", exception);
    } catch (RuntimeException exception) {
      recordUnknown(job, evaluation, "FEEDBACK", "FEEDBACK_UNEXPECTED");
      throw exception;
    }
  }

  private void complete(
      ClaimedJob job, PreparedSpeakingEvaluation evaluation, SpeakingFeedbackResult result) {
    try {
      fence.run(job, () -> workflow.complete(evaluation, result));
    } catch (IllegalArgumentException exception) {
      throw new NonRetryableJobException(
          "FEEDBACK_INVALID_RESPONSE", "Feedback provider returned an invalid response", exception);
    }
  }

  private void reserveBudget(ClaimedJob job, PreparedSpeakingEvaluation evaluation, String stage) {
    try {
      budgetManager.reserve(
          new ProviderBudgetReservationCommand(
              job.id(),
              evaluation.id(),
              evaluation.userId(),
              OPERATION,
              stage,
              Math.max(1, job.attempts())));
    } catch (ApiException exception) {
      if (exception.code().startsWith("PROVIDER_BUDGET_")) {
        throw new NonRetryableJobException(exception.code(), exception.getMessage(), exception);
      }
      throw exception;
    }
  }

  private void recordSuccess(
      ClaimedJob job,
      PreparedSpeakingEvaluation evaluation,
      String stage,
      String provider,
      String model,
      ProviderUsage usage) {
    recordSafely(
        ProviderUsageReceipt.succeeded(
            job.id(),
            evaluation.id(),
            evaluation.userId(),
            OPERATION,
            stage,
            Math.max(1, job.attempts()),
            provider,
            model,
            usage));
  }

  private void recordUnknown(
      ClaimedJob job, PreparedSpeakingEvaluation evaluation, String stage, String errorCode) {
    recordSafely(
        ProviderUsageReceipt.unknownFailure(
            job.id(),
            evaluation.id(),
            evaluation.userId(),
            OPERATION,
            stage,
            Math.max(1, job.attempts()),
            errorCode));
  }

  private void recordSafely(ProviderUsageReceipt receipt) {
    try {
      usageRecorder.record(receipt);
    } catch (RuntimeException exception) {
      log.warn(
          "Provider usage receipt could not be recorded: operationId={}, stage={}",
          receipt.operationId(),
          receipt.stage(),
          exception);
    }
  }

  private RuntimeException providerFailure(String stage, SpeakingProviderException exception) {
    String errorCode = stage + "_" + exception.failure().name();
    if (exception.failure().retryable()) {
      return new RetryableJobException(errorCode, exception.getMessage(), exception);
    }
    return new NonRetryableJobException(errorCode, exception.getMessage(), exception);
  }

  @Override
  public boolean isCompleted(ClaimedJob job) {
    return fence.execute(job, () -> workflow.isCompleted(job.resourceId(), job.ownerUserId()));
  }

  @Override
  public void onFinalFailure(ClaimedJob job, String errorCode) {
    fence.run(job, () -> workflow.failFinal(job.resourceId(), job.ownerUserId(), errorCode));
  }
}
