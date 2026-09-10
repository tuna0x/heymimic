package com.dev.heymimic.identity.infrastructure.worker;

import com.dev.heymimic.identity.application.port.IdentityEmailSender;
import com.dev.heymimic.identity.application.publicapi.VerificationWorkflow;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobExecutionFence;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import org.springframework.stereotype.Component;

@Component
public class VerificationEmailJobHandler implements JobHandler {
  private final VerificationWorkflow verification;
  private final IdentityEmailSender emailSender;
  private final JobExecutionFence fence;

  public VerificationEmailJobHandler(
      VerificationWorkflow verification, IdentityEmailSender emailSender, JobExecutionFence fence) {
    this.verification = verification;
    this.emailSender = emailSender;
    this.fence = fence;
  }

  @Override
  public String jobType() {
    return VerificationWorkflow.VERIFICATION_EMAIL_JOB;
  }

  @Override
  public void handle(ClaimedJob job) {
    var delivery = fence.execute(job, () -> verification.prepareDelivery(job.ownerUserId()));
    emailSender.sendVerification(delivery.email(), delivery.token());
  }
}
