package com.dev.heymimic.vocabulary.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetManager;
import com.dev.heymimic.platform.application.publicapi.ProviderBudgetReservationCommand;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageReceipt;
import com.dev.heymimic.platform.application.publicapi.ProviderUsageRecorder;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionPort;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionResult;
import com.dev.heymimic.vocabulary.application.publicapi.ContextAnalysisWorkflow;
import com.dev.heymimic.vocabulary.application.publicapi.PreparedContextAnalysis;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ContextAnalysisJobHandler implements JobHandler {
  private static final Logger log = LoggerFactory.getLogger(ContextAnalysisJobHandler.class);
  private static final String OPERATION = "CONTEXT_ANALYSIS";
  private static final String STAGE = "EXTRACTION";

  private final ContextAnalysisWorkflow workflow;
  private final VocabularyExtractionPort extraction;
  private final ProviderUsageRecorder usageRecorder;
  private final ProviderBudgetManager budgetManager;

  public ContextAnalysisJobHandler(
      ContextAnalysisWorkflow workflow, VocabularyExtractionPort extraction) {
    this(workflow, extraction, receipt -> {}, ProviderBudgetManager.noop());
  }

  public ContextAnalysisJobHandler(
      ContextAnalysisWorkflow workflow,
      VocabularyExtractionPort extraction,
      ProviderUsageRecorder usageRecorder) {
    this(workflow, extraction, usageRecorder, ProviderBudgetManager.noop());
  }

  @Autowired
  public ContextAnalysisJobHandler(
      ContextAnalysisWorkflow workflow,
      VocabularyExtractionPort extraction,
      ProviderUsageRecorder usageRecorder,
      ProviderBudgetManager budgetManager) {
    this.workflow = workflow;
    this.extraction = extraction;
    this.usageRecorder = usageRecorder;
    this.budgetManager = budgetManager;
  }

  @Override
  public String jobType() {
    return ContextAnalysisWorkflow.JOB_TYPE;
  }

  @Override
  public void handle(ClaimedJob job) {
    workflow
        .prepare(job.resourceId(), job.ownerUserId())
        .ifPresent(analysis -> extractAndComplete(job, analysis));
  }

  private void extractAndComplete(ClaimedJob job, PreparedContextAnalysis analysis) {
    try {
      budgetManager.reserve(
          new ProviderBudgetReservationCommand(
              job.id(),
              analysis.id(),
              analysis.userId(),
              OPERATION,
              STAGE,
              Math.max(1, job.attempts())));
    } catch (ApiException exception) {
      if (exception.code().startsWith("PROVIDER_BUDGET_")) {
        throw new NonRetryableJobException(exception.code(), exception.getMessage(), exception);
      }
      throw exception;
    }

    VocabularyExtractionResult result;
    try {
      result = extraction.extract(analysis.text(), analysis.targetLanguage());
    } catch (RuntimeException exception) {
      recordSafely(
          ProviderUsageReceipt.unknownFailure(
              job.id(),
              analysis.id(),
              analysis.userId(),
              OPERATION,
              STAGE,
              Math.max(1, job.attempts()),
              exception.getClass().getSimpleName()));
      throw exception;
    }

    var usage = result.usage();
    recordSafely(
        ProviderUsageReceipt.succeeded(
            job.id(),
            analysis.id(),
            analysis.userId(),
            OPERATION,
            STAGE,
            Math.max(1, job.attempts()),
            usage.requestId() == null ? "unknown" : "anthropic",
            null,
            usage));
    workflow.complete(analysis, result);
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

  @Override
  public void onFinalFailure(ClaimedJob job, String errorCode) {
    workflow.fail(job.resourceId(), job.ownerUserId(), errorCode);
  }
}
