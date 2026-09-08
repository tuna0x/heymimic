package com.dev.heymimic.speaking.application.port;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SpeakingFeedbackStore {
  void save(UUID evaluationId, List<SpeakingFeedbackItem> items, Instant now);
}
