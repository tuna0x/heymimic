package com.dev.heymimic.identity.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dev.heymimic.identity.infrastructure.email.InMemoryIdentityEmailSender;
import com.dev.heymimic.identity.infrastructure.worker.PasswordResetEmailJobHandler;
import com.dev.heymimic.identity.infrastructure.worker.VerificationEmailJobHandler;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import jakarta.servlet.http.Cookie;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
class IdentityRegistrationIT {
  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:17.6-alpine")
          .withDatabaseName("heymimic")
          .withUsername("heymimic")
          .withPassword("heymimic_test");

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
  }

  @Test
  void registrationAndRotatingSessionLifecycleAreEnforced(
      @Autowired MockMvc mvc,
      @Autowired JdbcTemplate jdbc,
      @Autowired JwtDecoder jwtDecoder,
      @Autowired JobQueue jobs,
      @Autowired VerificationEmailJobHandler verificationHandler,
      @Autowired PasswordResetEmailJobHandler passwordResetHandler,
      @Autowired InMemoryIdentityEmailSender emailSender)
      throws Exception {
    String body =
        """
        {"name":"Tuna","email":" Tuna@Example.com ",
         "password":"correct horse battery staple","timezone":"Asia/Bangkok"}
        """;

    mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isForbidden());

    mvc.perform(
            post("/api/v1/auth/register")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isCreated())
        .andExpect(header().string("Location", org.hamcrest.Matchers.startsWith("/api/v1/users/")))
        .andExpect(jsonPath("$.verificationRequired").value(true));

    assertThat(
            jdbc.queryForObject(
                "select count(*) from identity_users where email_normalized = 'tuna@example.com'",
                Integer.class))
        .isEqualTo(1);
    assertThat(jdbc.queryForObject("select count(*) from learner_profiles", Integer.class))
        .isEqualTo(1);
    assertThat(
            jdbc.queryForObject(
                "select password_hash from identity_users where email_normalized = 'tuna@example.com'",
                String.class))
        .startsWith("$argon2");

    mvc.perform(
            post("/api/v1/auth/register")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
    assertThat(jdbc.queryForObject("select count(*) from learner_profiles", Integer.class))
        .isEqualTo(1);
    assertThat(jdbc.queryForObject("select count(*) from platform_jobs", Integer.class))
        .isEqualTo(1);
    assertThat(
            jdbc.queryForObject(
                "select payload::text from platform_jobs where type ="
                    + " 'SEND_VERIFICATION_EMAIL'",
                String.class))
        .contains("VERIFY")
        .doesNotContain("token");
    assertThat(jdbc.queryForObject("select count(*) from identity_email_tokens", Integer.class))
        .isZero();

    mvc.perform(
            post("/api/v1/auth/login")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"email":"tuna@example.com","password":"definitely the wrong password"}
                    """))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

    var verificationJob =
        jobs.claimNext("identity-verification-test", Duration.ofMinutes(1)).orElseThrow();
    verificationHandler.handle(verificationJob);
    assertThat(
            jobs.succeed(
                verificationJob.id(),
                "identity-verification-test",
                verificationJob.leaseGeneration()))
        .isTrue();
    String verificationToken = emailSender.lastVerificationToken("tuna@example.com").orElseThrow();
    assertThat(
            jdbc.queryForObject(
                "select length(token_hash) from identity_email_tokens", Integer.class))
        .isEqualTo(64);
    assertThat(jdbc.queryForObject("select token_hash from identity_email_tokens", String.class))
        .doesNotContain(verificationToken);

    mvc.perform(
            post("/api/v1/auth/verify-email")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"token":"%s"}
                    """
                        .formatted(verificationToken)))
        .andExpect(status().isNoContent());
    assertThat(
            jdbc.queryForObject(
                "select verified_at is not null from identity_users where email_normalized ="
                    + " 'tuna@example.com'",
                Boolean.class))
        .isTrue();
    mvc.perform(
            post("/api/v1/auth/verify-email")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"token":"%s"}
                    """
                        .formatted(verificationToken)))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.code").value("INVALID_VERIFICATION_TOKEN"));
    mvc.perform(
            post("/api/v1/auth/resend-verification")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"email":"tuna@example.com"}
                    """))
        .andExpect(status().isAccepted())
        .andExpect(
            jsonPath("$.message")
                .value("If an unverified account exists, a verification email will be sent"));
    mvc.perform(
            post("/api/v1/auth/resend-verification")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"email":"unknown@example.com"}
                    """))
        .andExpect(status().isAccepted());
    assertThat(jdbc.queryForObject("select count(*) from platform_jobs", Integer.class))
        .isEqualTo(1);

    MvcResult login =
        mvc.perform(
                post("/api/v1/auth/login")
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"email":" TUNA@example.com ","password":"correct horse battery staple"}
                        """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.expiresIn").value(600))
            .andExpect(jsonPath("$.user.email").value("tuna@example.com"))
            .andExpect(jsonPath("$.user.verified").value(true))
            .andReturn();
    Cookie originalRefresh = login.getResponse().getCookie("__Secure-mimic_refresh");
    assertThat(originalRefresh).isNotNull();
    assertThat(originalRefresh.isHttpOnly()).isTrue();
    assertThat(originalRefresh.getSecure()).isTrue();
    String accessToken =
        com.jayway.jsonpath.JsonPath.read(
            login.getResponse().getContentAsString(), "$.accessToken");
    var jwt = jwtDecoder.decode(accessToken);
    assertThat(jwt.getSubject()).isNotBlank();
    assertThat(jwt.getAudience()).contains("heymimic-web");
    assertThat(jwt.getClaimAsString("sid")).isNotBlank();
    assertThat(
            jdbc.queryForObject(
                "select length(token_hash) from identity_refresh_tokens", Integer.class))
        .isEqualTo(64);

    MvcResult refreshed =
        mvc.perform(post("/api/v1/auth/refresh").with(csrf().asHeader()).cookie(originalRefresh))
            .andExpect(status().isOk())
            .andReturn();
    Cookie successorRefresh = refreshed.getResponse().getCookie("__Secure-mimic_refresh");
    assertThat(successorRefresh).isNotNull();
    assertThat(successorRefresh.getValue()).isNotEqualTo(originalRefresh.getValue());

    mvc.perform(post("/api/v1/auth/refresh").with(csrf().asHeader()).cookie(originalRefresh))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("REFRESH_TOKEN_REUSED"));
    assertThat(
            jdbc.queryForObject(
                "select count(*) from identity_session_families where revoked_at is not null",
                Integer.class))
        .isEqualTo(1);
    mvc.perform(post("/api/v1/auth/refresh").with(csrf().asHeader()).cookie(successorRefresh))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
    org.assertj.core.api.Assertions.assertThatThrownBy(() -> jwtDecoder.decode(accessToken))
        .isInstanceOf(JwtValidationException.class);

    MvcResult secondLogin =
        mvc.perform(
                post("/api/v1/auth/login")
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"email":"tuna@example.com","password":"correct horse battery staple"}
                        """))
            .andExpect(status().isOk())
            .andReturn();
    Cookie logoutRefresh = secondLogin.getResponse().getCookie("__Secure-mimic_refresh");
    String secondAccessToken =
        com.jayway.jsonpath.JsonPath.read(
            secondLogin.getResponse().getContentAsString(), "$.accessToken");
    mvc.perform(post("/api/v1/auth/logout").with(csrf().asHeader()).cookie(logoutRefresh))
        .andExpect(status().isNoContent())
        .andExpect(
            header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));
    mvc.perform(post("/api/v1/auth/refresh").with(csrf().asHeader()).cookie(logoutRefresh))
        .andExpect(status().isUnauthorized());
    org.assertj.core.api.Assertions.assertThatThrownBy(() -> jwtDecoder.decode(secondAccessToken))
        .isInstanceOf(JwtValidationException.class);

    MvcResult sessionBeforeReset =
        mvc.perform(
                post("/api/v1/auth/login")
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"email":"tuna@example.com","password":"correct horse battery staple"}
                        """))
            .andExpect(status().isOk())
            .andReturn();
    Cookie refreshBeforeReset =
        sessionBeforeReset.getResponse().getCookie("__Secure-mimic_refresh");
    String accessBeforeReset =
        com.jayway.jsonpath.JsonPath.read(
            sessionBeforeReset.getResponse().getContentAsString(), "$.accessToken");

    String forgotUnknownResponse =
        mvc.perform(
                post("/api/v1/auth/forgot-password")
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"email":"unknown@example.com"}
                        """))
            .andExpect(status().isAccepted())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String forgotExistingResponse =
        mvc.perform(
                post("/api/v1/auth/forgot-password")
                    .with(csrf().asHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {"email":" TUNA@example.com "}
                        """))
            .andExpect(status().isAccepted())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertThat(forgotExistingResponse).isEqualTo(forgotUnknownResponse);
    assertThat(jdbc.queryForObject("select count(*) from platform_jobs", Integer.class))
        .isEqualTo(2);
    assertThat(
            jdbc.queryForObject(
                """
                select payload::text from platform_jobs
                where type = 'SEND_PASSWORD_RESET_EMAIL'
                """,
                String.class))
        .contains("RESET")
        .doesNotContain("token");

    var passwordResetJob =
        jobs.claimNext("password-reset-test", Duration.ofMinutes(1)).orElseThrow();
    assertThat(passwordResetJob.type()).isEqualTo("SEND_PASSWORD_RESET_EMAIL");
    passwordResetHandler.handle(passwordResetJob);
    assertThat(
            jobs.succeed(
                passwordResetJob.id(), "password-reset-test", passwordResetJob.leaseGeneration()))
        .isTrue();
    String passwordResetToken =
        emailSender.lastPasswordResetToken("tuna@example.com").orElseThrow();
    assertThat(
            jdbc.queryForObject(
                """
                select length(token_hash) from identity_email_tokens
                where purpose = 'RESET' and consumed_at is null
                """,
                Integer.class))
        .isEqualTo(64);
    assertThat(
            jdbc.queryForObject(
                "select token_hash from identity_email_tokens where purpose = 'RESET'",
                String.class))
        .doesNotContain(passwordResetToken);

    mvc.perform(
            post("/api/v1/auth/reset-password")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"token":"invalid-token","newPassword":"a new secure password"}
                    """))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));
    mvc.perform(
            post("/api/v1/auth/reset-password")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"token":"%s","newPassword":"a new secure password"}
                    """
                        .formatted(passwordResetToken)))
        .andExpect(status().isNoContent());
    assertThat(
            jdbc.queryForObject(
                "select auth_version from identity_users where email_normalized ="
                    + " 'tuna@example.com'",
                Long.class))
        .isEqualTo(1L);
    assertThat(
            jdbc.queryForObject(
                "select count(*) from identity_session_families where revoked_at is null",
                Integer.class))
        .isZero();
    org.assertj.core.api.Assertions.assertThatThrownBy(() -> jwtDecoder.decode(accessBeforeReset))
        .isInstanceOf(JwtValidationException.class);
    mvc.perform(post("/api/v1/auth/refresh").with(csrf().asHeader()).cookie(refreshBeforeReset))
        .andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/v1/auth/reset-password")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"token":"%s","newPassword":"another secure password"}
                    """
                        .formatted(passwordResetToken)))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));

    mvc.perform(
            post("/api/v1/auth/login")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"email":"tuna@example.com","password":"correct horse battery staple"}
                    """))
        .andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/v1/auth/login")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"email":"tuna@example.com","password":"a new secure password"}
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.verified").value(true));

    mvc.perform(
            post("/api/v1/auth/forgot-password")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"email":"tuna@example.com"}
                    """))
        .andExpect(status().isAccepted());
    mvc.perform(
            post("/api/v1/auth/forgot-password")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"email":"tuna@example.com"}
                    """))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
  }
}
