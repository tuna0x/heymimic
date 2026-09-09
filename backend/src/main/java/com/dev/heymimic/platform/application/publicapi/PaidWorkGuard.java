package com.dev.heymimic.platform.application.publicapi;

import java.util.UUID;

public interface PaidWorkGuard {
  boolean canUsePaidWork(UUID userId);
}
