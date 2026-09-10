package com.dev.heymimic.platform.application.publicapi;

import java.util.function.Supplier;

/** Executes DB-only work under the job lease in the same transaction. */
public interface JobExecutionFence {
  <T> T execute(ClaimedJob job, Supplier<T> work);

  default void run(ClaimedJob job, Runnable work) {
    execute(
        job,
        () -> {
          work.run();
          return null;
        });
  }
}
