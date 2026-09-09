package com.dev.heymimic.vocabulary.api;

import java.util.List;

public record VocabularyWordPageResponse(
    List<VocabularyWordResponse> items, int page, int size, long totalItems, int totalPages) {}
