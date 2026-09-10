package com.dev.heymimic.contract;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dev.heymimic.identity.api.AccountLifecycleController;
import com.dev.heymimic.identity.api.AuthController;
import com.dev.heymimic.identity.application.publicapi.AccountDeletion;
import com.dev.heymimic.identity.application.publicapi.IdentityAccountReader;
import com.dev.heymimic.identity.application.publicapi.IdentityAuthentication;
import com.dev.heymimic.identity.application.publicapi.PasswordRecoveryWorkflow;
import com.dev.heymimic.identity.application.publicapi.UserRegistration;
import com.dev.heymimic.identity.application.publicapi.VerificationWorkflow;
import com.dev.heymimic.learner.api.CapabilityController;
import com.dev.heymimic.learner.api.MeController;
import com.dev.heymimic.learner.api.UsageController;
import com.dev.heymimic.learner.application.publicapi.LearnerProfiles;
import com.dev.heymimic.peer.api.PeerSessionController;
import com.dev.heymimic.peer.application.PeerPractice;
import com.dev.heymimic.platform.application.port.QuotaStore;
import com.dev.heymimic.platform.infrastructure.config.QuotaConfiguration;
import com.dev.heymimic.progress.api.ProgressController;
import com.dev.heymimic.progress.application.publicapi.MistakeQueries;
import com.dev.heymimic.progress.application.publicapi.ProgressQueries;
import com.dev.heymimic.shared.config.FeatureConfiguration;
import com.dev.heymimic.shared.config.OpenApiConfiguration;
import com.dev.heymimic.shared.config.TimeConfiguration;
import com.dev.heymimic.speaking.api.SpeakingSessionController;
import com.dev.heymimic.speaking.application.publicapi.SpeakingAttempts;
import com.dev.heymimic.speaking.application.publicapi.SpeakingEvaluations;
import com.dev.heymimic.speaking.application.publicapi.SpeakingPractice;
import com.dev.heymimic.study.api.StudySessionController;
import com.dev.heymimic.study.application.publicapi.StudySessions;
import com.dev.heymimic.vocabulary.api.ContextAnalysisController;
import com.dev.heymimic.vocabulary.api.ReviewSessionController;
import com.dev.heymimic.vocabulary.api.VocabularyController;
import com.dev.heymimic.vocabulary.application.publicapi.ContextAnalyses;
import com.dev.heymimic.vocabulary.application.publicapi.ReviewSessions;
import com.dev.heymimic.vocabulary.application.publicapi.VocabularyWords;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(classes = OpenApiContractTest.ContractApplication.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class OpenApiContractTest {
  @MockitoBean AccountDeletion accountDeletion;
  @MockitoBean UserRegistration userRegistration;
  @MockitoBean IdentityAuthentication identityAuthentication;
  @MockitoBean VerificationWorkflow verificationWorkflow;
  @MockitoBean PasswordRecoveryWorkflow passwordRecoveryWorkflow;
  @MockitoBean IdentityAccountReader identityAccountReader;
  @MockitoBean LearnerProfiles learnerProfiles;
  @MockitoBean ProgressQueries progressQueries;
  @MockitoBean MistakeQueries mistakeQueries;
  @MockitoBean SpeakingPractice speakingPractice;
  @MockitoBean SpeakingAttempts speakingAttempts;
  @MockitoBean SpeakingEvaluations speakingEvaluations;
  @MockitoBean StudySessions studySessions;
  @MockitoBean ContextAnalyses contextAnalyses;
  @MockitoBean ReviewSessions reviewSessions;
  @MockitoBean VocabularyWords vocabularyWords;
  @MockitoBean QuotaStore quotaStore;
  @MockitoBean PeerPractice peerPractice;

  @Test
  void exportsAllCoreModulePaths(@Autowired MockMvc mvc) throws Exception {
    String contract =
        mvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.info.title").value("HeyMimic API"))
            .andExpect(jsonPath("$.info.version").value("v1"))
            .andExpect(jsonPath("$.paths['/api/v1/auth/login']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/vocabulary/words']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/speaking/sessions']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/study-sessions']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/progress/daily']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/me/capabilities']").exists())
            .andExpect(jsonPath("$.paths['/api/v1/me/usage']").exists())
            .andReturn()
            .getResponse()
            .getContentAsString(StandardCharsets.UTF_8);

    Path output = Path.of("target", "generated-openapi", "openapi.json");
    Files.createDirectories(output.getParent());
    Files.writeString(output, contract + System.lineSeparator(), StandardCharsets.UTF_8);
    assertThat(Files.size(output)).isGreaterThan(1_000);

    Path committed = Path.of("openapi", "openapi.json");
    if (Files.exists(committed) && !Boolean.getBoolean("heymimic.openapi.update")) {
      ObjectMapper mapper = new ObjectMapper();
      assertThat(mapper.readTree(contract))
          .as("OpenAPI drift detected; run scripts/export-openapi.ps1 and regenerate frontend DTOs")
          .isEqualTo(mapper.readTree(Files.readString(committed, StandardCharsets.UTF_8)));
    }
  }

  @SpringBootConfiguration
  @EnableAutoConfiguration(
      exclude = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        FlywayAutoConfiguration.class
      })
  @Import({
    FeatureConfiguration.class,
    OpenApiConfiguration.class,
    QuotaConfiguration.class,
    TimeConfiguration.class,
    AccountLifecycleController.class,
    AuthController.class,
    MeController.class,
    CapabilityController.class,
    UsageController.class,
    ProgressController.class,
    SpeakingSessionController.class,
    PeerSessionController.class,
    StudySessionController.class,
    ContextAnalysisController.class,
    ReviewSessionController.class,
    VocabularyController.class
  })
  static class ContractApplication {}
}
