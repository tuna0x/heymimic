package com.dev.heymimic.vocabulary.application.publicapi;

import java.util.UUID;

public record StartedContextAnalysis(
    UUID analysisId, String status, String pollUrl, boolean replayed) {}
