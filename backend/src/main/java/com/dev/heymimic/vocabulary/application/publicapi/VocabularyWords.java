package com.dev.heymimic.vocabulary.application.publicapi;

import java.time.Instant;
import java.util.UUID;

public interface VocabularyWords {
  VocabularyWordPageView find(UUID userId, String status, Instant dueBefore, int page, int size);

  VocabularyWordView update(UUID userId, UUID wordId, UpdateVocabularyWord command);
}
