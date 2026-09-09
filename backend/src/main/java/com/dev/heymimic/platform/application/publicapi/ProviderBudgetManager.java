package com.dev.heymimic.platform.application.publicapi;

public interface ProviderBudgetManager {
  void reserve(ProviderBudgetReservationCommand command);

  void reconcile(ProviderUsageReceipt receipt);

  static ProviderBudgetManager noop() {
    return new ProviderBudgetManager() {
      @Override
      public void reserve(ProviderBudgetReservationCommand command) {}

      @Override
      public void reconcile(ProviderUsageReceipt receipt) {}
    };
  }
}
