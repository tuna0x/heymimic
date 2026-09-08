package com.dev.heymimic.vocabulary.application.port;

import java.util.List;

public record VocabularyWordPage(
    List<VocabularyWordRecord> items, int page, int size, long totalItems, int totalPages) {}
