package com.dev.heymimic.support;

import com.dev.heymimic.platform.application.publicapi.ClaimedJob;
import com.dev.heymimic.platform.application.publicapi.JobExecutionFence;
import java.util.function.Supplier;

public final class TestJobFences {
  private TestJobFences() {}

  public static org.springframework.transaction.support.TransactionTemplate transactions() {
    return new org.springframework.transaction.support.TransactionTemplate() {
      @Override
      public <T> T execute(org.springframework.transaction.support.TransactionCallback<T> action) {
        return action.doInTransaction(
            new org.springframework.transaction.support.SimpleTransactionStatus());
      }
    };
  }

  public static JobExecutionFence direct() {
    return new JobExecutionFence() {
      public <T> T execute(ClaimedJob job, Supplier<T> work) {
        return work.get();
      }
    };
  }
}
