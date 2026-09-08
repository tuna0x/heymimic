package com.dev.heymimic.speaking.application.publicapi;

import java.util.UUID;

public record SpeakingTopicView(
    UUID id,
    String title,
    String category,
    String categoryLabel,
    String level,
    String prompt,
    SpeakingTopicContentView content,
    int revision) {}
