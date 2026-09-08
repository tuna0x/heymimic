package com.dev.heymimic.vocabulary.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.UUID;

public record RateReviewWordRequest(
    @NotNull UUID wordId, @NotBlank String rating, @PositiveOrZero long expectedVersion) {}
