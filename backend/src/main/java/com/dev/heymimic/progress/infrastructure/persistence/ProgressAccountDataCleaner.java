package com.dev.heymimic.progress.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import com.dev.heymimic.progress.application.port.ActivityLedgerStore;
import com.dev.heymimic.progress.application.port.DailyActivityStore;
import com.dev.heymimic.progress.application.port.MistakePatternStore;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ProgressAccountDataCleaner implements AccountDataCleaner {
  private final ActivityLedgerStore ledger;
  private final DailyActivityStore dailyActivities;
  private final MistakePatternStore mistakes;

  public ProgressAccountDataCleaner(
      ActivityLedgerStore ledger,
      DailyActivityStore dailyActivities,
      MistakePatternStore mistakes) {
    this.ledger = ledger;
    this.dailyActivities = dailyActivities;
    this.mistakes = mistakes;
  }

  @Override
  public String cleanerName() {
    return "progress";
  }

  @Override
  public int order() {
    return 300;
  }

  @Override
  @Transactional
  public void clean(UUID userId, UUID deletionJobId) {
    mistakes.deleteByUserId(userId);
    dailyActivities.deleteByUserId(userId);
    ledger.deleteByUserId(userId);
  }
}
