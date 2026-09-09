package com.dev.heymimic.platform.application.publicapi;

import java.util.UUID;

public interface AccountDataCleaner {
  String cleanerName();

  int order();

  void clean(UUID userId, UUID deletionJobId);
}
