package com.dev.heymimic.learner.application;

import com.dev.heymimic.learner.application.port.LearnerProfileStore;
import com.dev.heymimic.learner.application.publicapi.CreateLearnerProfile;
import com.dev.heymimic.learner.application.publicapi.LearnerProfileCreator;
import java.time.Clock;
import org.springframework.stereotype.Service;

@Service
public class LearnerProfileService implements LearnerProfileCreator {
  private final LearnerProfileStore store;
  private final Clock clock;

  public LearnerProfileService(LearnerProfileStore store, Clock clock) {
    this.store = store;
    this.clock = clock;
  }

  @Override
  public void create(CreateLearnerProfile command) {
    store.create(command.userId(), command.name(), command.timezone(), clock.instant());
  }
}
