package com.dev.heymimic.peer.application;

import java.util.UUID;

public record PeerScenarioRecord(
    UUID id,
    int version,
    String title,
    String category,
    String categoryLabel,
    String level,
    String commonObjective,
    String description,
    int durationMinutes,
    String phasesJson,
    String recommendedVocabJson) {}
