package com.dev.heymimic.speaking.application.port;

import java.util.UUID;

public record SpeakingTopicRecord(
    UUID id,
    String title,
    String category,
    String categoryLabel,
    String level,
    String prompt,
    String contentJson,
    int revision) {}
