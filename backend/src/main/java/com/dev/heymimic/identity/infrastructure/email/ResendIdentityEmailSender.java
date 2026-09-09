package com.dev.heymimic.identity.infrastructure.email;

import com.dev.heymimic.identity.application.port.IdentityEmailSender;
import com.dev.heymimic.identity.infrastructure.config.ResendEmailConfiguration.Properties;
import com.dev.heymimic.platform.application.publicapi.NonRetryableJobException;
import com.dev.heymimic.platform.application.publicapi.RetryableJobException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

public final class ResendIdentityEmailSender implements IdentityEmailSender {
  private final RestClient client;
  private final Properties properties;

  private ResendIdentityEmailSender(RestClient client, Properties properties) {
    this.client = client;
    this.properties = properties;
  }

  public static ResendIdentityEmailSender create(Properties properties) {
    var requestFactory =
        new JdkClientHttpRequestFactory(
            HttpClient.newBuilder().connectTimeout(properties.requestTimeout()).build());
    requestFactory.setReadTimeout(properties.requestTimeout());
    RestClient client =
        RestClient.builder()
            .requestFactory(requestFactory)
            .baseUrl(properties.apiBaseUrl())
            .defaultHeader("Authorization", "Bearer " + properties.apiKey())
            .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
            .build();
    return new ResendIdentityEmailSender(client, properties);
  }

  @Override
  public void sendVerification(String email, String token) {
    send(
        email,
        "Xác nhận email HeyMimic",
        "Xác nhận địa chỉ email của bạn để bắt đầu học.",
        link("/verify-email", token));
  }

  @Override
  public void sendPasswordReset(String email, String token) {
    send(
        email,
        "Đặt lại mật khẩu HeyMimic",
        "Liên kết đặt lại mật khẩu chỉ có hiệu lực trong thời gian giới hạn.",
        link("/reset-password", token));
  }

  private URI link(String path, String token) {
    String base = properties.publicAppUrl().replaceAll("/+$", "");
    return URI.create(base + path + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8));
  }

  private void send(String email, String subject, String description, URI action) {
    var body =
        new ResendEmailRequest(
            properties.fromAddress(),
            email,
            subject,
            "<p>" + description + "</p><p><a href=\"" + action + "\">Mở HeyMimic</a></p>");
    try {
      client
          .post()
          .uri("/emails")
          .contentType(MediaType.APPLICATION_JSON)
          .body(body)
          .retrieve()
          .toBodilessEntity();
    } catch (RestClientResponseException exception) {
      int status = exception.getStatusCode().value();
      if (status == 401 || status == 403 || (status >= 400 && status < 500 && status != 429)) {
        throw new NonRetryableJobException(
            status == 401 || status == 403
                ? "EMAIL_PROVIDER_AUTHENTICATION_FAILED"
                : "EMAIL_PROVIDER_REJECTED",
            "Email provider rejected the request",
            exception);
      }
      throw new RetryableJobException(
          status == 429 ? "EMAIL_PROVIDER_RATE_LIMITED" : "EMAIL_PROVIDER_UNAVAILABLE",
          "Email provider request can be retried",
          exception);
    } catch (RestClientException exception) {
      throw new RetryableJobException(
          "EMAIL_PROVIDER_UNAVAILABLE", "Email provider request can be retried", exception);
    }
  }

  private record ResendEmailRequest(String from, String to, String subject, String html) {}
}
