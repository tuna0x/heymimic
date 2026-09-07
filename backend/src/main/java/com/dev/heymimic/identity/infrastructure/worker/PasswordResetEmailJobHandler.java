package com.dev.heymimic.identity.infrastructure.worker;

import com.dev.heymimic.identity.application.port.IdentityEmailSender;
import com.dev.heymimic.identity.application.publicapi.PasswordRecoveryWorkflow;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import org.springframework.stereotype.Component;

@Component
public class PasswordResetEmailJobHandler implements JobHandler {
  private final PasswordRecoveryWorkflow passwordRecovery;
  private final IdentityEmailSender emailSender;

  public PasswordResetEmailJobHandler(
      PasswordRecoveryWorkflow passwordRecovery, IdentityEmailSender emailSender) {
    this.passwordRecovery = passwordRecovery;
    this.emailSender = emailSender;
  }

  @Override
  public String jobType() {
    return PasswordRecoveryWorkflow.PASSWORD_RESET_EMAIL_JOB;
  }

  @Override
  public void handle(ClaimedJob job) {
    var delivery = passwordRecovery.prepareDelivery(job.ownerUserId());
    emailSender.sendPasswordReset(delivery.email(), delivery.token());
  }
}
