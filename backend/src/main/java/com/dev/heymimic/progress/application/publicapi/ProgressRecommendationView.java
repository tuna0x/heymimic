package com.dev.heymimic.progress.application.publicapi;

import java.util.UUID;

public record ProgressRecommendationView(
    String kind, String title, UUID targetId, long availableCount) {}
