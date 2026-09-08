package com.dev.heymimic.speaking.application;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

public final class SpeakingFeedbackIdentity {
  private SpeakingFeedbackIdentity() {}

  public static UUID id(UUID evaluationId, int position) {
    return UUID.nameUUIDFromBytes((evaluationId + ":" + position).getBytes(StandardCharsets.UTF_8));
  }
}
