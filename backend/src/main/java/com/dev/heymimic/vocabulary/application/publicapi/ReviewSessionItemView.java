package com.dev.heymimic.vocabulary.application.publicapi;

import java.util.UUID;

public record ReviewSessionItemView(
    UUID id, int position, ReviewSessionWordView word, UUID activeRatingEventId) {}
