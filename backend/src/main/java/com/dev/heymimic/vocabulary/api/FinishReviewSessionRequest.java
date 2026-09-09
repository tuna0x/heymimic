package com.dev.heymimic.vocabulary.api;

import jakarta.validation.constraints.PositiveOrZero;

public record FinishReviewSessionRequest(@PositiveOrZero long expectedVersion) {}
