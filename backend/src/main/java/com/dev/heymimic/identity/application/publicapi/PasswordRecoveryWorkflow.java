package com.dev.heymimic.identity.application.publicapi;

import java.util.UUID;

public interface PasswordRecoveryWorkflow {
  String PASSWORD_RESET_EMAIL_JOB = "SEND_PASSWORD_RESET_EMAIL";

  void requestReset(String email, String clientAddress);

  PreparedPasswordReset prepareDelivery(UUID userId);

  void resetPassword(String token, String newPassword);
}
