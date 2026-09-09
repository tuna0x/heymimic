package com.dev.heymimic.platform.infrastructure.ai;

public class AnthropicProviderException extends RuntimeException {
  private final AnthropicFailure failure;

  public AnthropicProviderException(AnthropicFailure failure, String message, Throwable cause) {
    super(message, cause);
    if (failure == null) throw new IllegalArgumentException("Provider failure is required");
    this.failure = failure;
  }

  public AnthropicFailure failure() {
    return failure;
  }
}
