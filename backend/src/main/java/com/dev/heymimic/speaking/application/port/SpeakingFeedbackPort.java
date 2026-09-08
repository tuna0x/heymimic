package com.dev.heymimic.speaking.application.port;

public interface SpeakingFeedbackPort {
  SpeakingFeedbackResult evaluate(SpeakingFeedbackRequest request);
}
