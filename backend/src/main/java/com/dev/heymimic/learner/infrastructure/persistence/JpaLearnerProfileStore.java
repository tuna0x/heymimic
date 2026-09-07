package com.dev.heymimic.learner.infrastructure.persistence;

import com.dev.heymimic.learner.application.port.LearnerProfileStore;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaLearnerProfileStore implements LearnerProfileStore {
  private final JpaLearnerProfileRepository repository;

  public JpaLearnerProfileStore(JpaLearnerProfileRepository repository) {
    this.repository = repository;
  }

  @Override
  public void create(UUID userId, String name, String timezone, Instant now) {
    repository.saveAndFlush(new LearnerProfileEntity(userId, name, timezone, now));
  }
}
