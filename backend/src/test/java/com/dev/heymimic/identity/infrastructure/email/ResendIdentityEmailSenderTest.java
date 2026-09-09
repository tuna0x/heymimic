package com.dev.heymimic.identity.infrastructure.email;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dev.heymimic.identity.infrastructure.config.ResendEmailConfiguration.Properties;
import com.dev.heymimic.platform.application.publicapi.RetryableJobException;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ResendIdentityEmailSenderTest {
  private HttpServer server;
  private AtomicReference<String> requestBody;
  private AtomicReference<String> authorization;
  private int status;

  @BeforeEach
  void setUp() throws Exception {
    requestBody = new AtomicReference<>();
    authorization = new AtomicReference<>();
    status = 202;
    server = HttpServer.create(new InetSocketAddress(0), 0);
    server.createContext(
        "/emails",
        exchange -> {
          requestBody.set(
              new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
          authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
          exchange.sendResponseHeaders(status, -1);
          exchange.close();
        });
    server.start();
  }

  @AfterEach
  void tearDown() {
    server.stop(0);
  }

  @Test
  void sendsVerificationEmailWithEncodedTokenAndProviderAuth() {
    ResendIdentityEmailSender sender = ResendIdentityEmailSender.create(properties());

    sender.sendVerification("learner@example.com", "token+/with spaces");

    assertThat(authorization).hasValue("Bearer test-key");
    assertThat(requestBody)
        .hasValueSatisfying(
            body -> {
              assertThat(body).contains("\"from\":\"HeyMimic <noreply@example.com>\"");
              assertThat(body).contains("\"to\":\"learner@example.com\"");
              assertThat(body).contains("verify-email?token=token%2B%2Fwith+spaces");
            });
  }

  @Test
  void mapsRateLimitToRetryableJobFailure() {
    status = 429;
    ResendIdentityEmailSender sender = ResendIdentityEmailSender.create(properties());

    assertThatThrownBy(() -> sender.sendPasswordReset("learner@example.com", "reset-token"))
        .isInstanceOf(RetryableJobException.class)
        .hasFieldOrPropertyWithValue("errorCode", "EMAIL_PROVIDER_RATE_LIMITED");
  }

  private Properties properties() {
    return new Properties(
        "resend",
        "test-key",
        "HeyMimic <noreply@example.com>",
        "http://localhost:5173/",
        "http://localhost:" + server.getAddress().getPort(),
        Duration.ofSeconds(2));
  }
}
