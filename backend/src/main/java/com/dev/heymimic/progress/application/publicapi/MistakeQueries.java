package com.dev.heymimic.progress.application.publicapi;

import java.util.UUID;

public interface MistakeQueries {
  MistakePatternPageView find(UUID userId, String status, String category, int page, int size);

  MistakeDetailView get(UUID userId, UUID patternId, int page, int size);

  MistakePatternView updateStatus(UUID userId, UUID patternId, String status, long expectedVersion);
}
