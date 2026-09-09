package com.dev.heymimic.vocabulary.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ContextAnalysisResponse(
    UUID id,
    String status,
    List<VocabularySuggestionResponse> suggestions,
    String source,
    Instant expiresAt,
    String errorCode) {}
