package com.dev.heymimic.platform.application.publicapi;

public record ProviderUsage(
    String requestId,
    Long inputTokens,
    Long outputTokens,
    Long audioMilliseconds,
    Long characters) {

  public ProviderUsage {
    if (inputTokens != null && inputTokens < 0) inputTokens = null;
    if (outputTokens != null && outputTokens < 0) outputTokens = null;
    if (audioMilliseconds != null && audioMilliseconds < 0) audioMilliseconds = null;
    if (characters != null && characters < 0) characters = null;
  }

  public static ProviderUsage unknown() {
    return new ProviderUsage(null, null, null, null, null);
  }
}
