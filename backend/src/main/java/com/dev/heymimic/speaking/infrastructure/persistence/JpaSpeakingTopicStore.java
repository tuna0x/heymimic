package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.speaking.application.port.SpeakingTopicRecord;
import com.dev.heymimic.speaking.application.port.SpeakingTopicStore;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaSpeakingTopicStore implements SpeakingTopicStore {
  private final JpaSpeakingTopicRepository repository;

  public JpaSpeakingTopicStore(JpaSpeakingTopicRepository repository) {
    this.repository = repository;
  }

  @Override
  public List<SpeakingTopicRecord> findAvailable(String category, String level) {
    return repository.findAvailable(category, level).stream().map(this::record).toList();
  }

  @Override
  public Optional<SpeakingTopicRecord> findAvailableById(UUID id) {
    return repository.findByIdAndArchivedAtIsNull(id).map(this::record);
  }

  private SpeakingTopicRecord record(SpeakingTopicEntity topic) {
    return new SpeakingTopicRecord(
        topic.id(),
        topic.title(),
        topic.category(),
        topic.categoryLabel(),
        topic.level(),
        topic.prompt(),
        topic.content(),
        topic.revision());
  }
}
