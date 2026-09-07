package com.dev.heymimic.identity.application.port;

public interface IdentityEmailSender {
  void sendVerification(String email, String token);

  void sendPasswordReset(String email, String token);
}
