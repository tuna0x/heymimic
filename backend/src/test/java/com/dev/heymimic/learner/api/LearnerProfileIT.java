package com.dev.heymimic.learner.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dev.heymimic.identity.infrastructure.worker.AccountDeletionJobHandler;
import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import jakarta.servlet.http.Cookie;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
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
class LearnerProfileIT {
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
  void profileOnboardingAndPasswordChangeEnforceOwnershipAndConcurrency(
      @Autowired MockMvc mvc,
      @Autowired JdbcTemplate jdbc,
      @Autowired JobQueue jobs,
      @Autowired AccountDeletionJobHandler deletionHandler)
      throws Exception {
    String registration =
        """
        {"name":"Tuna","email":"profile@example.com",
         "password":"correct horse battery staple","timezone":"Asia/Bangkok"}
        """;
    mvc.perform(
            post("/api/v1/auth/register")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(registration))
        .andExpect(status().isCreated());

    MvcResult login = login(mvc, "correct horse battery staple", status().isOk());
    String accessToken =
        com.jayway.jsonpath.JsonPath.read(
            login.getResponse().getContentAsString(), "$.accessToken");
    Cookie refreshToken = login.getResponse().getCookie("__Secure-mimic_refresh");
    assertThat(refreshToken).isNotNull();

    mvc.perform(get("/api/v1/me")).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/v1/me").header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Tuna"))
        .andExpect(jsonPath("$.email").value("profile@example.com"))
        .andExpect(jsonPath("$.emailVerified").value(false))
        .andExpect(jsonPath("$.targetLanguage").value("en"))
        .andExpect(jsonPath("$.onboardingCompleted").value(false))
        .andExpect(jsonPath("$.version").value(0));

    String onboarding =
        """
        {"goal":"work","selfAssessedLevel":"beginner","dailyMinutesGoal":10,
         "targetLanguage":"en","timezone":"Asia/Bangkok"}
        """;
    mvc.perform(
            put("/api/v1/me/onboarding")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(onboarding))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.onboardingCompleted").value(true))
        .andExpect(jsonPath("$.goal").value("work"))
        .andExpect(jsonPath("$.version").value(1));

    mvc.perform(
            put("/api/v1/me/onboarding")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(onboarding))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.version").value(1));
    mvc.perform(
            put("/api/v1/me/onboarding")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(onboarding.replace("work", "casual")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("ONBOARDING_ALREADY_COMPLETED"));

    mvc.perform(
            patch("/api/v1/me/profile")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"name":" Tuna Updated ","dailyMinutesGoal":15,
                     "timezone":"UTC","expectedVersion":1}
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Tuna Updated"))
        .andExpect(jsonPath("$.dailyMinutesGoal").value(15))
        .andExpect(jsonPath("$.timezone").value("UTC"))
        .andExpect(jsonPath("$.version").value(2));
    mvc.perform(
            patch("/api/v1/me/profile")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Stale\",\"expectedVersion\":1}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("PROFILE_VERSION_CONFLICT"));
    mvc.perform(
            patch("/api/v1/me/profile")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"   \",\"expectedVersion\":2}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_PROFILE_NAME"));

    mvc.perform(
            post("/api/v1/auth/change-password")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"currentPassword":"correct horse battery staple",
                     "newPassword":"a completely new secure password"}
                    """))
        .andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/v1/auth/change-password")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"currentPassword":"wrong current password",
                     "newPassword":"a completely new secure password"}
                    """))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CURRENT_PASSWORD"));
    mvc.perform(
            post("/api/v1/auth/change-password")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(accessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"currentPassword":"correct horse battery staple",
                     "newPassword":"a completely new secure password"}
                    """))
        .andExpect(status().isNoContent())
        .andExpect(
            header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));

    assertThat(
            jdbc.queryForObject(
                "select auth_version from identity_users where email_normalized = 'profile@example.com'",
                Long.class))
        .isEqualTo(1L);
    mvc.perform(get("/api/v1/me").header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
        .andExpect(status().isUnauthorized());
    mvc.perform(post("/api/v1/auth/refresh").with(csrf().asHeader()).cookie(refreshToken))
        .andExpect(status().isUnauthorized());
    login(mvc, "correct horse battery staple", status().isUnauthorized());
    MvcResult loginBeforeDeletion = login(mvc, "a completely new secure password", status().isOk());
    String deletionAccessToken =
        com.jayway.jsonpath.JsonPath.read(
            loginBeforeDeletion.getResponse().getContentAsString(), "$.accessToken");

    String deletionRequest =
        """
        {"currentPassword":"a completely new secure password","confirmation":"DELETE"}
        """;
    mvc.perform(
            delete("/api/v1/me")
                .header(HttpHeaders.AUTHORIZATION, bearer(deletionAccessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(deletionRequest))
        .andExpect(status().isForbidden());
    mvc.perform(
            delete("/api/v1/me")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(deletionAccessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"currentPassword":"wrong current password","confirmation":"DELETE"}
                    """))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CURRENT_PASSWORD"));
    mvc.perform(
            delete("/api/v1/me")
                .with(csrf().asHeader())
                .header(HttpHeaders.AUTHORIZATION, bearer(deletionAccessToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(deletionRequest))
        .andExpect(status().isAccepted())
        .andExpect(
            header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));
    mvc.perform(get("/api/v1/me").header(HttpHeaders.AUTHORIZATION, bearer(deletionAccessToken)))
        .andExpect(status().isUnauthorized());

    ClaimedJob deletionJob;
    do {
      ClaimedJob claimed = jobs.claimNext("deletion-test", Duration.ofMinutes(2)).orElseThrow();
      if ("DELETE_ACCOUNT".equals(claimed.type())) {
        deletionJob = claimed;
        break;
      }
      assertThat(
              jobs.failFinal(
                  claimed.id(), "deletion-test", claimed.leaseGeneration(), "DISCARDED_BY_TEST"))
          .isTrue();
    } while (true);
    deletionHandler.handle(deletionJob);
    assertThat(jobs.succeed(deletionJob.id(), "deletion-test", deletionJob.leaseGeneration()))
        .isTrue();

    assertThat(jdbc.queryForObject("select count(*) from identity_users", Integer.class)).isZero();
    assertThat(jdbc.queryForObject("select count(*) from learner_profiles", Integer.class))
        .isZero();
    assertThat(
            jdbc.queryForObject(
                "select completed_at is not null from identity_deletion_tombstones", Boolean.class))
        .isTrue();
  }

  private MvcResult login(
      MockMvc mvc,
      String password,
      org.springframework.test.web.servlet.ResultMatcher expectedStatus)
      throws Exception {
    return mvc.perform(
            post("/api/v1/auth/login")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"email":"profile@example.com","password":"%s"}
                    """
                        .formatted(password)))
        .andExpect(expectedStatus)
        .andReturn();
  }

  private String bearer(String accessToken) {
    return "Bearer " + accessToken;
  }
}
