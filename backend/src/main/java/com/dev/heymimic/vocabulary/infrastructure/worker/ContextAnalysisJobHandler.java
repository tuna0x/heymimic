package com.dev.heymimic.vocabulary.infrastructure.worker;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionPort;
import com.dev.heymimic.vocabulary.application.publicapi.ContextAnalysisWorkflow;
import org.springframework.stereotype.Component;

@Component
public class ContextAnalysisJobHandler implements JobHandler {
  private final ContextAnalysisWorkflow workflow;
  private final VocabularyExtractionPort extraction;

  public ContextAnalysisJobHandler(
      ContextAnalysisWorkflow workflow, VocabularyExtractionPort extraction) {
    this.workflow = workflow;
    this.extraction = extraction;
  }

  @Override
  public String jobType() {
    return ContextAnalysisWorkflow.JOB_TYPE;
  }

  @Override
  public void handle(ClaimedJob job) {
    workflow
        .prepare(job.resourceId(), job.ownerUserId())
        .ifPresent(
            analysis ->
                workflow.complete(
                    analysis, extraction.extract(analysis.text(), analysis.targetLanguage())));
  }

  @Override
  public void onFinalFailure(ClaimedJob job, String errorCode) {
    workflow.fail(job.resourceId(), job.ownerUserId(), errorCode);
  }
}
