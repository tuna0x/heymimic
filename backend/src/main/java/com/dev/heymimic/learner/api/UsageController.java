package com.dev.heymimic.learner.api;

import com.dev.heymimic.platform.application.port.QuotaStore;
import com.dev.heymimic.platform.application.publicapi.QuotaLimits;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class UsageController {
  private final QuotaLimits quotas;
  private final QuotaStore quotaStore;
  private final Clock clock;

  public UsageController(QuotaLimits quotas, QuotaStore quotaStore, Clock clock) {
    this.quotas = quotas;
    this.quotaStore = quotaStore;
    this.clock = clock;
  }

  @GetMapping("/usage")
  UsageResponse get(@AuthenticationPrincipal Jwt jwt) {
    UUID userId = UUID.fromString(jwt.getSubject());
    Instant now = clock.instant();
    LocalDate today = now.atZone(ZoneOffset.UTC).toLocalDate();
    Instant resetAt = today.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
    var operations = new LinkedHashMap<String, QuotaUsageResponse>();
    for (var entry : quotas.dailyLimits().entrySet()) {
      int limit = entry.getValue();
      int used = quotaStore.usedAmount(userId, entry.getKey(), today);
      operations.put(
          entry.getKey(), new QuotaUsageResponse(limit, used, Math.max(0, limit - used), resetAt));
    }
    return new UsageResponse(Map.copyOf(operations));
  }
}
