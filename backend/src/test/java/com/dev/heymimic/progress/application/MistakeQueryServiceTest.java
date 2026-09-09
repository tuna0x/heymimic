package com.dev.heymimic.progress.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.dev.heymimic.progress.application.port.MistakePatternRecord;
import com.dev.heymimic.progress.application.port.MistakePatternStore;
import com.dev.heymimic.progress.domain.MistakeStatus;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MistakeQueryServiceTest {
  private static final Instant NOW = Instant.parse("2026-09-08T03:00:00Z");
  private final UUID userId = UUID.randomUUID();
  private final UUID patternId = UUID.randomUUID();
  private final MistakePatternStore mistakes = mock(MistakePatternStore.class);
  private final MistakeQueryService service =
      new MistakeQueryService(mistakes, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void updatesStatusWithOptimisticVersion() {
    var active = pattern(MistakeStatus.ACTIVE, 2);
    var resolved = pattern(MistakeStatus.RESOLVED, 3);
    when(mistakes.findOwned(userId, patternId))
        .thenReturn(Optional.of(active), Optional.of(resolved));
    when(mistakes.updateStatus(userId, patternId, MistakeStatus.RESOLVED, 2, NOW)).thenReturn(true);

    var result = service.updateStatus(userId, patternId, "resolved", 2);

    assertThat(result.status()).isEqualTo(MistakeStatus.RESOLVED);
    assertThat(result.version()).isEqualTo(3);
    assertThat(result.occurrenceCount()).isEqualTo(4);
  }

  @Test
  void rejectsConcurrentStatusUpdate() {
    when(mistakes.findOwned(userId, patternId))
        .thenReturn(Optional.of(pattern(MistakeStatus.ACTIVE, 2)));
    when(mistakes.updateStatus(userId, patternId, MistakeStatus.IGNORED, 1, NOW)).thenReturn(false);

    assertThatThrownBy(() -> service.updateStatus(userId, patternId, "ignored", 1))
        .isInstanceOfSatisfying(
            ApiException.class,
            exception -> assertThat(exception.code()).isEqualTo("MISTAKE_VERSION_CONFLICT"));
  }

  private MistakePatternRecord pattern(MistakeStatus status, long version) {
    return new MistakePatternRecord(
        patternId,
        userId,
        "GRAMMAR",
        "grammar.past",
        "speaking-feedback-v1",
        "grammar past",
        "Use past tense",
        status,
        version,
        NOW.minusSeconds(60),
        NOW,
        4);
  }
}
