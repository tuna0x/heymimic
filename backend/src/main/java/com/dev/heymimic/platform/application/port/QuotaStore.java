package com.dev.heymimic.platform.application.port;

import com.dev.heymimic.platform.application.publicapi.ReserveQuota;
import com.dev.heymimic.platform.domain.QuotaReservationStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface QuotaStore {
  Optional<QuotaReservation> findByResource(UUID resourceId, String quotaKind);

  Optional<QuotaReservation> findById(UUID reservationId);

  void lockBucket(UUID userId, String quotaKind, LocalDate quotaDate);

  int usedAmount(UUID userId, String quotaKind, LocalDate quotaDate);

  UUID insert(UUID reservationId, ReserveQuota command, LocalDate quotaDate, Instant now);

  boolean transition(
      UUID reservationId,
      UUID userId,
      QuotaReservationStatus expected,
      QuotaReservationStatus target,
      Instant now);
}
