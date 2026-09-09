package com.dev.heymimic.speaking.infrastructure.persistence;

import com.dev.heymimic.speaking.application.SpeakingFeedbackIdentity;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackItem;
import com.dev.heymimic.speaking.application.port.SpeakingFeedbackStore;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;
import org.springframework.stereotype.Repository;

@Repository
public class JpaSpeakingFeedbackStore implements SpeakingFeedbackStore {
  private final JpaSpeakingFeedbackRepository repository;

  public JpaSpeakingFeedbackStore(JpaSpeakingFeedbackRepository repository) {
    this.repository = repository;
  }

  @Override
  public void save(UUID evaluationId, List<SpeakingFeedbackItem> items, Instant now) {
    var entities =
        IntStream.range(0, items.size())
            .mapToObj(index -> entity(evaluationId, index, items.get(index), now))
            .toList();
    repository.saveAllAndFlush(entities);
  }

  private SpeakingFeedbackItemEntity entity(
      UUID evaluationId, int position, SpeakingFeedbackItem item, Instant now) {
    UUID id = SpeakingFeedbackIdentity.id(evaluationId, position);
    return new SpeakingFeedbackItemEntity(
        id,
        evaluationId,
        position,
        item.category(),
        item.originalText(),
        item.improvedText(),
        item.note(),
        item.patternKey(),
        now);
  }
}
