package com.dev.heymimic.vocabulary.application.publicapi;

import java.util.List;

public record VocabularyWordPageView(
    List<VocabularyWordView> items, int page, int size, long totalItems, int totalPages) {}
