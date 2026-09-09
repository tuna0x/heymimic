package com.dev.heymimic.learner.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dev.heymimic.platform.application.port.QuotaStore;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class UsageControllerTest {
  private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
  private static final Instant NOW = Instant.parse("2026-09-09T08:00:00Z");

  private final QuotaStore quotaStore = mock(QuotaStore.class);
  private final UsageController controller =
      new UsageController(
          () -> Map.of("SPEAKING_EVALUATION", 20), quotaStore, Clock.fixed(NOW, ZoneOffset.UTC));

  @Test
  void reportsUsedRemainingAndNextUtcReset() {
    when(quotaStore.usedAmount(USER_ID, "SPEAKING_EVALUATION", java.time.LocalDate.of(2026, 9, 9)))
        .thenReturn(3);

    var response = controller.get(jwt());
    var usage = response.operations().get("SPEAKING_EVALUATION");

    assertThat(usage.limit()).isEqualTo(20);
    assertThat(usage.used()).isEqualTo(3);
    assertThat(usage.remaining()).isEqualTo(17);
    assertThat(usage.resetAt()).isEqualTo(Instant.parse("2026-09-10T00:00:00Z"));
    verify(quotaStore)
        .usedAmount(USER_ID, "SPEAKING_EVALUATION", java.time.LocalDate.of(2026, 9, 9));
  }

  private Jwt jwt() {
    return Jwt.withTokenValue("test-token")
        .header("alg", "none")
        .subject(USER_ID.toString())
        .build();
  }
}
