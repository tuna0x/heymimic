package com.dev.heymimic.vocabulary.application;

import com.dev.heymimic.platform.application.publicapi.QuotaManager;
import com.dev.heymimic.vocabulary.application.port.ContextAnalysisStore;
import com.dev.heymimic.vocabulary.domain.ContextAnalysisStatus;
import java.time.Clock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VocabularyContextAnalysisCleanupService {
  private final ContextAnalysisStore analyses;
  private final QuotaManager quotas;
  private final Clock clock;

  public VocabularyContextAnalysisCleanupService(
      ContextAnalysisStore analyses, QuotaManager quotas, Clock clock) {
    this.analyses = analyses;
    this.quotas = quotas;
    this.clock = clock;
  }

  @Transactional
  public int cleanupExpiredBatch(int batchSize) {
    if (batchSize < 1 || batchSize > 1_000) {
      throw new IllegalArgumentException("Cleanup batch size must be between 1 and 1000");
    }
    var expired = analyses.lockExpired(clock.instant(), batchSize);
    expired.forEach(
        analysis -> {
          if (analysis.status() == ContextAnalysisStatus.PENDING) {
            quotas.release(analysis.quotaReservationId(), analysis.userId());
          }
          analyses.delete(analysis);
        });
    return expired.size();
  }
}
