package com.dev.heymimic.identity.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SensitiveRequestRedactionTest {
  @Test
  void secretsAreNotRenderedByRequestToString() {
    String password = "correct horse battery staple";
    String verificationToken = "secret-verification-token";

    assertThat(new LoginRequest("tuna@example.com", password).toString())
        .contains("[REDACTED]")
        .doesNotContain(password);
    assertThat(new RegisterRequest("Tuna", "tuna@example.com", password, "Asia/Bangkok").toString())
        .contains("[REDACTED]")
        .doesNotContain(password);
    assertThat(new VerifyEmailRequest(verificationToken).toString())
        .contains("[REDACTED]")
        .doesNotContain(verificationToken);
    assertThat(new ResetPasswordRequest(verificationToken, password).toString())
        .contains("[REDACTED]")
        .doesNotContain(verificationToken)
        .doesNotContain(password);
  }
}
