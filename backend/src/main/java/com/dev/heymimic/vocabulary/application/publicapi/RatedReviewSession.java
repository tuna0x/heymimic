package com.dev.heymimic.vocabulary.application.publicapi;

import java.util.UUID;

public record RatedReviewSession(UUID eventId, ReviewSessionView session, boolean replayed) {}
