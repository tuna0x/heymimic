package com.dev.heymimic.progress.infrastructure.persistence;

import com.dev.heymimic.progress.application.port.ActivityLedgerEntry;
import com.dev.heymimic.progress.application.port.ActivityLedgerStore;
import java.time.Clock;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JpaActivityLedgerStore implements ActivityLedgerStore {
  private final JpaActivityLedgerRepository repository;
  private final Clock clock;

  public JpaActivityLedgerStore(JpaActivityLedgerRepository repository, Clock clock) {
    this.repository = repository;
    this.clock = clock;
  }

  @Override
  @Transactional
  public boolean append(ActivityLedgerEntry entry) {
    return repository.insertIfAbsent(
            UUID.randomUUID(),
            entry.userId(),
            entry.eventId(),
            entry.sourceType().name(),
            entry.sourceId(),
            entry.activityDate(),
            entry.timezoneSnapshot(),
            entry.durationSeconds(),
            entry.ruleVersion(),
            entry.occurredAt(),
            clock.instant())
        == 1;
  }

  @Override
  @Transactional
  public void deleteByUserId(UUID userId) {
    repository.deleteByUserId(userId);
    repository.flush();
  }
}
