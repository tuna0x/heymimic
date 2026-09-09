package com.dev.heymimic.speaking.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpeakingTopicStore {
  List<SpeakingTopicRecord> findAvailable(String category, String level);

  Optional<SpeakingTopicRecord> findAvailableById(UUID id);
}
