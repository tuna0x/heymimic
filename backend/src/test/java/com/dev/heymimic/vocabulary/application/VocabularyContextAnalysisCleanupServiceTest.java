package com.dev.heymimic.vocabulary.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.publicapi.QuotaManager;
import com.dev.heymimic.vocabulary.application.port.ContextAnalysisRecord;
import com.dev.heymimic.vocabulary.application.port.ContextAnalysisStore;
import com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class VocabularyContextAnalysisCleanupServiceTest {
  private static final Instant NOW = Instant.parse("2026-09-07T12:00:00Z");
  private final ContextAnalysisStore analyses = mock(ContextAnalysisStore.class);
  private final QuotaManager quotas = mock(QuotaManager.class);
  private final VocabularyContextAnalysisCleanupService cleanup =
      new VocabularyContextAnalysisCleanupService(
          analyses, quotas, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void releasesPendingReservationBeforeDeletingExpiredAnalysis() {
    ContextAnalysisRecord analysis = analysis(ContextAnalysisStatus.PENDING);
    when(analyses.lockExpired(NOW, 100)).thenReturn(List.of(analysis));

    assertThat(cleanup.cleanupExpiredBatch(100)).isEqualTo(1);

    var ordered = org.mockito.Mockito.inOrder(quotas, analyses);
    ordered.verify(quotas).release(analysis.quotaReservationId(), analysis.userId());
    ordered.verify(analyses).delete(analysis);
  }

  @Test
  void deletesTerminalAnalysisWithoutChangingQuota() {
    ContextAnalysisRecord analysis = analysis(ContextAnalysisStatus.COMPLETED);
    when(analyses.lockExpired(NOW, 100)).thenReturn(List.of(analysis));

    assertThat(cleanup.cleanupExpiredBatch(100)).isEqualTo(1);

    verify(quotas, never()).release(analysis.quotaReservationId(), analysis.userId());
    verify(analyses).delete(analysis);
  }

  private ContextAnalysisRecord analysis(ContextAnalysisStatus status) {
    return new ContextAnalysisRecord(
        UUID.randomUUID(),
        UUID.randomUUID(),
        "Context",
        "en",
        status,
        null,
        UUID.randomUUID(),
        UUID.randomUUID(),
        null,
        NOW.minusSeconds(1));
  }
}
