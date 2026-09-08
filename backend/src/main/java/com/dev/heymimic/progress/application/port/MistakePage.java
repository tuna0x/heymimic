package com.dev.heymimic.progress.application.port;

import java.util.List;

public record MistakePage<T>(List<T> items, int page, int size, long totalItems, int totalPages) {}
