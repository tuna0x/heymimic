package com.dev.heymimic.identity.infrastructure.worker;

import com.dev.heymimic.identity.application.port.IdentityEmailSender;
import com.dev.heymimic.identity.application.publicapi.VerificationWorkflow;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import org.springframework.stereotype.Component;

@Component
public class VerificationEmailJobHandler implements JobHandler {
  private final VerificationWorkflow verification;
  private final IdentityEmailSender emailSender;

  public VerificationEmailJobHandler(
      VerificationWorkflow verification, IdentityEmailSender emailSender) {
    this.verification = verification;
    this.emailSender = emailSender;
  }

  @Override
  public String jobType() {
    return VerificationWorkflow.VERIFICATION_EMAIL_JOB;
  }

  @Override
  public void handle(ClaimedJob job) {
    var delivery = verification.prepareDelivery(job.ownerUserId());
    emailSender.sendVerification(delivery.email(), delivery.token());
  }
}
