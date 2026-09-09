package com.dev.heymimic.speaking.application.port;

import com.dev.heymimic.platform.application.publicapi.ProviderUsage;

public record SpeakingTranscriptionResult(
    String source, String transcript, String provider, String model, ProviderUsage usage) {

  public SpeakingTranscriptionResult {
    if (usage == null) usage = ProviderUsage.unknown();
  }

  public SpeakingTranscriptionResult(
      String source, String transcript, String provider, String model) {
    this(source, transcript, provider, model, ProviderUsage.unknown());
  }
}
