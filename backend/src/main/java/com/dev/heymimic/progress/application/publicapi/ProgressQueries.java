package com.dev.heymimic.progress.application.publicapi;

import java.time.LocalDate;
import java.util.UUID;

public interface ProgressQueries {
  DailyProgressView daily(UUID userId, LocalDate from, LocalDate to);

  ProgressOverviewView overview(UUID userId);
}
