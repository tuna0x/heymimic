package com.dev.heymimic.platform.application.port;

import com.dev.heymimic.platform.domain.QuotaReservationStatus;
import java.time.LocalDate;
import java.util.UUID;

public record QuotaReservation(
    UUID id,
    UUID userId,
    UUID resourceId,
    String quotaKind,
    int amount,
    QuotaReservationStatus status,
    LocalDate quotaDate) {}
