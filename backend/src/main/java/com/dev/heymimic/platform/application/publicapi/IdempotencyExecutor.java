package com.dev.heymimic.platform.application.publicapi;

import java.util.function.Supplier;

public interface IdempotencyExecutor {
  IdempotentResponse execute(
      IdempotencyCommand command, Supplier<IdempotentResponse> businessOperation);
}
