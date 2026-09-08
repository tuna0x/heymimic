package com.dev.heymimic.progress.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.dev.heymimic.progress.application.port.DailyProjectionRebuilder;
import com.dev.heymimic.progress.application.port.ProjectionRebuildRecord;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ProgressProjectionMaintenanceServiceTest {
  private final DailyProjectionRebuilder rebuilder = mock(DailyProjectionRebuilder.class);
  private final ProgressProjectionMaintenanceService service =
      new ProgressProjectionMaintenanceService(rebuilder);

  @Test
  void returnsValidatedRebuildMetadata() {
    UUID generationId = UUID.randomUUID();
    Instant watermark = Instant.parse("2026-09-08T03:00:00Z");
    Instant activatedAt = watermark.plusSeconds(1);
    when(rebuilder.rebuild("daily-v2"))
        .thenReturn(
            new ProjectionRebuildRecord(
                generationId, "daily-v2", 12, 900, 4, watermark, activatedAt));

    var result = service.rebuildDaily("daily-v2");

    assertThat(result.generationId()).isEqualTo(generationId);
    assertThat(result.sourceRows()).isEqualTo(12);
    assertThat(result.sourceSeconds()).isEqualTo(900);
    assertThat(result.projectedDays()).isEqualTo(4);
  }

  @Test
  void rejectsUnsafeRuleVersionBeforeStartingRebuild() {
    assertThatThrownBy(() -> service.rebuildDaily("Daily V2!"))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
