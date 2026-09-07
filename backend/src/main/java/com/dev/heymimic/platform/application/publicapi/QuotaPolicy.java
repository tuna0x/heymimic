package com.dev.heymimic.platform.application.publicapi;

public interface QuotaPolicy {
  int dailyLimit(String quotaKind);
}
