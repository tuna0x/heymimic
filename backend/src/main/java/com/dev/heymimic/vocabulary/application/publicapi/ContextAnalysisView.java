package com.dev.heymimic.vocabulary.application.publicapi;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ContextAnalysisView(
    UUID id,
    String status,
    List<VocabularySuggestionView> suggestions,
    String source,
    Instant expiresAt,
    String errorCode) {}
