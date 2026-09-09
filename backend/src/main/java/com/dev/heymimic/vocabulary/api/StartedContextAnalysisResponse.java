package com.dev.heymimic.vocabulary.api;

import java.util.UUID;

public record StartedContextAnalysisResponse(UUID analysisId, String status, String pollUrl) {}
