package com.dev.heymimic.vocabulary.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateVocabularyWordRequest(
    @Size(min = 1, max = 1000) String meaning,
    @Size(min = 1, max = 2000) String example,
    @Size(min = 1, max = 4000) String sourceContext,
    @NotNull @PositiveOrZero Long expectedVersion) {}
