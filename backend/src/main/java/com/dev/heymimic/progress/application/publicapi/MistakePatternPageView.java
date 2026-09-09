package com.dev.heymimic.progress.application.publicapi;

import java.util.List;

public record MistakePatternPageView(
    List<MistakePatternView> items, int page, int size, long totalItems, int totalPages) {}
