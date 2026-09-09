package com.dev.heymimic.study.infrastructure.persistence;

import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import com.dev.heymimic.study.application.port.StudySessionStore;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class StudyAccountDataCleaner implements AccountDataCleaner {
  private final StudySessionStore sessions;

  public StudyAccountDataCleaner(StudySessionStore sessions) {
    this.sessions = sessions;
  }

  @Override
  public String cleanerName() {
    return "study";
  }

  @Override
  public int order() {
    return 275;
  }

  @Override
  @Transactional
  public void clean(UUID userId, UUID deletionJobId) {
    sessions.deleteByUserId(userId);
  }
}
