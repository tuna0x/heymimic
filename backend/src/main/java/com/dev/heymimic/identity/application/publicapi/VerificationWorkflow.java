package com.dev.heymimic.identity.application.publicapi;

import java.util.UUID;

public interface VerificationWorkflow {
  String VERIFICATION_EMAIL_JOB = "SEND_VERIFICATION_EMAIL";

  void schedule(UUID userId);

  void resend(String email, String clientAddress);

  PreparedVerification prepareDelivery(UUID userId);

  void verify(String token);
}
