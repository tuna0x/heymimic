package com.dev.heymimic.speaking.application;

import com.dev.heymimic.speaking.application.port.SpeakingAttemptRecord;
import com.dev.heymimic.speaking.application.port.SpeakingAttemptStore;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SpeakingAudioRetentionCommitter {
  private final SpeakingAttemptStore attempts;

  public SpeakingAudioRetentionCommitter(SpeakingAttemptStore attempts) {
    this.attempts = attempts;
  }

  @Transactional
  public boolean markDeleted(SpeakingAttemptRecord attempt, Instant now) {
    return attempts.markAudioDeleted(attempt.id(), attempt.version(), now);
  }
}
