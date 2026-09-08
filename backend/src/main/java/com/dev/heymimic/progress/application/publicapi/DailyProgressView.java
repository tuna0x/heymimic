package com.dev.heymimic.progress.application.publicapi;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record DailyProgressView(
    LocalDate from,
    LocalDate to,
    List<DailyActivityView> days,
    Instant projectedThrough,
    boolean pendingProjection) {}
