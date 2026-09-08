package com.dev.heymimic.progress.application.port;

import java.util.UUID;

public interface ActivityLedgerStore {
  boolean append(ActivityLedgerEntry entry);

  void deleteByUserId(UUID userId);
}
