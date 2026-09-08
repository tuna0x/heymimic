package com.dev.heymimic.speaking.application.publicapi;

import java.util.List;

public record SpeakingSessionHistoryPage(
    List<SpeakingSessionView> items, int page, int size, long totalItems, int totalPages) {}
