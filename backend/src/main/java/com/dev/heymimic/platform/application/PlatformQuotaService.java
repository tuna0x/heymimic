package com.dev.heymimic.platform.application;

import com.dev.heymimic.platform.application.port.QuotaReservation;
import com.dev.heymimic.platform.application.port.QuotaStore;
import com.dev.heymimic.platform.application.publicapi.QuotaManager;
import com.dev.heymimic.platform.application.publicapi.QuotaPolicy;
import com.dev.heymimic.platform.application.publicapi.ReserveQuota;
import com.dev.heymimic.platform.domain.QuotaReservationStatus;
import com.dev.heymimic.shared.error.ApiException;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformQuotaService implements QuotaManager {
  private final QuotaStore store;
  private final QuotaPolicy policy;
  private final Clock clock;

  public PlatformQuotaService(QuotaStore store, QuotaPolicy policy, Clock clock) {
    this.store = store;
    this.policy = policy;
    this.clock = clock;
  }

  @Override
  @Transactional
  public UUID reserve(ReserveQuota command) {
    var existing = store.findByResource(command.resourceId(), command.quotaKind());
    if (existing.isPresent()) return validateReplay(existing.orElseThrow(), command);

    LocalDate quotaDate = LocalDate.ofInstant(clock.instant(), ZoneOffset.UTC);
    store.lockBucket(command.userId(), command.quotaKind(), quotaDate);
    existing = store.findByResource(command.resourceId(), command.quotaKind());
    if (existing.isPresent()) return validateReplay(existing.orElseThrow(), command);

    int used = store.usedAmount(command.userId(), command.quotaKind(), quotaDate);
    if ((long) used + command.amount() > policy.dailyLimit(command.quotaKind())) {
      throw new ApiException(
          HttpStatus.TOO_MANY_REQUESTS,
          "QUOTA_EXCEEDED",
          "The daily quota for this operation has been exhausted");
    }
    return store.insert(UUID.randomUUID(), command, quotaDate, clock.instant());
  }

  @Override
  @Transactional
  public void consume(UUID reservationId, UUID userId) {
    transition(reservationId, userId, QuotaReservationStatus.CONSUMED);
  }

  @Override
  @Transactional
  public void release(UUID reservationId, UUID userId) {
    transition(reservationId, userId, QuotaReservationStatus.RELEASED);
  }

  private UUID validateReplay(QuotaReservation reservation, ReserveQuota command) {
    if (!reservation.userId().equals(command.userId())
        || reservation.amount() != command.amount()
        || !reservation.quotaKind().equals(command.quotaKind())) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "QUOTA_RESERVATION_CONFLICT",
          "The resource already has a different quota reservation");
    }
    return reservation.id();
  }

  private void transition(UUID reservationId, UUID userId, QuotaReservationStatus targetStatus) {
    QuotaReservation reservation =
        store
            .findById(reservationId)
            .filter(found -> found.userId().equals(userId))
            .orElseThrow(
                () ->
                    new ApiException(
                        HttpStatus.NOT_FOUND,
                        "QUOTA_RESERVATION_NOT_FOUND",
                        "Quota reservation was not found"));
    if (reservation.status() == targetStatus) return;
    if (reservation.status() != QuotaReservationStatus.RESERVED
        || !store.transition(
            reservationId,
            userId,
            QuotaReservationStatus.RESERVED,
            targetStatus,
            clock.instant())) {
      QuotaReservation current = store.findById(reservationId).orElse(reservation);
      if (current.status() == targetStatus) return;
      throw new ApiException(
          HttpStatus.CONFLICT,
          "QUOTA_RESERVATION_STATE_CONFLICT",
          "Quota reservation is already terminal");
    }
  }
}
