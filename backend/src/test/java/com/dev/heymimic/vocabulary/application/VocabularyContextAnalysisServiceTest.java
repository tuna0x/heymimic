package com.dev.heymimic.vocabulary.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.platform.application.publicapi.JobQueue;
import com.dev.heymimic.platform.application.publicapi.PaidWorkGuard;
import com.dev.heymimic.platform.application.publicapi.QuotaManager;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.vocabulary.application.port.ContextAnalysisRecord;
import com.dev.heymimic.vocabulary.application.port.ContextAnalysisStore;
import com.dev.heymimic.vocabulary.application.port.ExtractedVocabularySuggestion;
import com.dev.heymimic.vocabulary.application.port.VocabularyExtractionResult;
import com.dev.heymimic.vocabulary.application.port.VocabularyWordStore;
import com.dev.heymimic.vocabulary.application.publicapi.PreparedContextAnalysis;
import com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class VocabularyContextAnalysisServiceTest {
  private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
  private static final UUID IDEMPOTENCY_KEY =
      UUID.fromString("00000000-0000-0000-0000-000000000222");
  private static final UUID RESERVATION_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000333");
  private static final UUID JOB_ID = UUID.fromString("00000000-0000-0000-0000-000000000444");
  private static final Instant NOW = Instant.parse("2026-09-07T12:00:00Z");
  private final ContextAnalysisStore analyses = mock(ContextAnalysisStore.class);
  private final VocabularyWordStore words = mock(VocabularyWordStore.class);
  private final IdempotencyExecutor idempotency = mock(IdempotencyExecutor.class);
  private final QuotaManager quotas = mock(QuotaManager.class);
  private final JobQueue jobs = mock(JobQueue.class);
  private final PaidWorkGuard paidWorkGuard = mock(PaidWorkGuard.class);
  private final VocabularyContextAnalysisService service =
      new VocabularyContextAnalysisService(
          analyses,
          words,
          idempotency,
          quotas,
          jobs,
          paidWorkGuard,
          new ObjectMapper(),
          Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void unverifiedAccountIsRejectedBeforeIdempotencyAndQuota() {
    when(paidWorkGuard.canUsePaidWork(USER_ID)).thenReturn(false);

    assertThatThrownBy(() -> service.start(USER_ID, IDEMPOTENCY_KEY, "A steady practice", "en"))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("EMAIL_VERIFICATION_REQUIRED"));
    verify(idempotency, never()).execute(any(), any());
    verify(quotas, never()).reserve(any());
  }

  @Test
  @SuppressWarnings("unchecked")
  void startCreatesQuotaJobAndAnalysisInsideIdempotentOperation() {
    when(paidWorkGuard.canUsePaidWork(USER_ID)).thenReturn(true);
    when(quotas.reserve(any())).thenReturn(RESERVATION_ID);
    when(jobs.enqueue(any())).thenReturn(JOB_ID);
    when(idempotency.execute(any(), any()))
        .thenAnswer(invocation -> ((Supplier<IdempotentResponse>) invocation.getArgument(1)).get());

    var result = service.start(USER_ID, IDEMPOTENCY_KEY, " A steady practice ", "EN");

    assertThat(result.status()).isEqualTo("pending");
    assertThat(result.pollUrl()).endsWith(result.analysisId().toString());
    verify(idempotency)
        .execute(
            eq(
                new IdempotencyCommand(
                    USER_ID,
                    "vocabulary.context-analysis.create",
                    IDEMPOTENCY_KEY,
                    "en\nA steady practice",
                    java.time.Duration.ofDays(1))),
            any());
    verify(analyses)
        .create(
            eq(result.analysisId()),
            eq(USER_ID),
            any(),
            eq("A steady practice"),
            eq("en"),
            eq(JOB_ID),
            eq(RESERVATION_ID),
            eq(NOW.plus(java.time.Duration.ofDays(7))),
            eq(NOW));
  }

  @Test
  void completionPersistsValidatedResultBeforeConsumingQuota() {
    UUID analysisId = UUID.randomUUID();
    var prepared =
        new PreparedContextAnalysis(analysisId, USER_ID, "A steady practice", "en", RESERVATION_ID);
    var result =
        new VocabularyExtractionResult(
            "fake",
            List.of(
                new ExtractedVocabularySuggestion(
                    "steady",
                    "ổn định",
                    "/ˈstedi/",
                    "adjective",
                    "A steady practice works.",
                    "Luyện tập đều đặn sẽ hiệu quả.",
                    "A steady practice")));
    when(analyses.complete(eq(analysisId), eq(USER_ID), any(), eq(NOW))).thenReturn(true);

    service.complete(prepared, result);

    verify(analyses).complete(eq(analysisId), eq(USER_ID), any(), eq(NOW));
    verify(quotas).consume(RESERVATION_ID, USER_ID);
  }

  @Test
  void finalFailureTransitionsPendingAnalysisAndConsumesReservedQuota() {
    UUID analysisId = UUID.randomUUID();
    when(analyses.findOwned(analysisId, USER_ID))
        .thenReturn(
            Optional.of(
                new ContextAnalysisRecord(
                    analysisId,
                    USER_ID,
                    "A steady practice",
                    "en",
                    ContextAnalysisStatus.PENDING,
                    null,
                    JOB_ID,
                    RESERVATION_ID,
                    null,
                    NOW.plusSeconds(300))));
    when(analyses.fail(analysisId, USER_ID, "REMOTE_TIMEOUT", NOW)).thenReturn(true);

    service.fail(analysisId, USER_ID, "REMOTE_TIMEOUT");

    verify(analyses).fail(analysisId, USER_ID, "REMOTE_TIMEOUT", NOW);
    verify(quotas).consume(RESERVATION_ID, USER_ID);
  }
}
