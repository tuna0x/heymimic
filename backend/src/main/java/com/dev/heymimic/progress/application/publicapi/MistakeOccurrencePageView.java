package com.dev.heymimic.progress.application.publicapi;

import java.util.List;

public record MistakeOccurrencePageView(
    List<MistakeOccurrenceView> items, int page, int size, long totalItems, int totalPages) {}
