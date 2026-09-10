package com.dev.heymimic.peer.api;

import java.util.List;
import java.util.UUID;

public record PeerScenarioView(
    UUID id,
    int version,
    String title,
    String category,
    String categoryLabel,
    String level,
    String commonObjective,
    String description,
    int durationMinutes,
    List<PeerPhaseView> phases,
    List<String> recommendedVocab) {}
