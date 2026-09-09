package com.dev.heymimic.platform.application.publicapi;

@FunctionalInterface
public interface ProviderUsageRecorder {
  void record(ProviderUsageReceipt receipt);
}
