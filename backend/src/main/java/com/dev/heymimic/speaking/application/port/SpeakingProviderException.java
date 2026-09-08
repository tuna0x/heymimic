package com.dev.heymimic.speaking.application.port;

public class SpeakingProviderException extends RuntimeException {
  private final SpeakingProviderFailure failure;

  public SpeakingProviderException(
      SpeakingProviderFailure failure, String message, Throwable cause) {
    super(message, cause);
    if (failure == null) throw new IllegalArgumentException("Provider failure is required");
    this.failure = failure;
  }

  public SpeakingProviderFailure failure() {
    return failure;
  }
}
