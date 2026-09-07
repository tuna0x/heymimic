package com.dev.heymimic.platform.application.publicapi;

import java.util.UUID;

public interface AccountWorkGuard {
  boolean canStartWork(UUID userId);
}
