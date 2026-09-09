package com.dev.heymimic.speaking.application.port;

import java.util.List;

public record SpeakingSessionPage(
    List<SpeakingSessionRecord> items, int page, int size, long totalItems, int totalPages) {}
