package com.dev.heymimic.identity.infrastructure.worker;

import com.dev.heymimic.identity.application.port.IdentityEmailSender;
import com.dev.heymimic.identity.application.publicapi.PasswordRecoveryWorkflow;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobExecutionFence;
import com.dev.heymimic.platform.application.publicapi.JobHandler;
import org.springframework.stereotype.Component;

@Component
public class PasswordResetEmailJobHandler implements JobHandler {
  private final PasswordRecoveryWorkflow passwordRecovery;
  private final IdentityEmailSender emailSender;
  private final JobExecutionFence fence;

  public PasswordResetEmailJobHandler(
      PasswordRecoveryWorkflow passwordRecovery,
      IdentityEmailSender emailSender,
      JobExecutionFence fence) {
    this.passwordRecovery = passwordRecovery;
    this.emailSender = emailSender;
    this.fence = fence;
  }

  @Override
  public String jobType() {
    return PasswordRecoveryWorkflow.PASSWORD_RESET_EMAIL_JOB;
  }

  @Override
  public void handle(ClaimedJob job) {
    var delivery = fence.execute(job, () -> passwordRecovery.prepareDelivery(job.ownerUserId()));
    emailSender.sendPasswordReset(delivery.email(), delivery.token());
  }
}
