package com.dev.heymimic.vocabulary.application.publicapi;

import java.util.UUID;

public record PreparedContextAnalysis(
    UUID id, UUID userId, String text, String targetLanguage, UUID quotaReservationId) {}
