package com.dev.heymimic.speaking.application.port;

public interface SpeakingTranscriptionPort {
  SpeakingTranscriptionResult transcribe(SpeakingTranscriptionRequest request);
}
