package com.dev.heymimic.study.api;

import jakarta.validation.constraints.PositiveOrZero;

public record AdvanceStudyStepRequest(
    @PositiveOrZero int targetStep, @PositiveOrZero long expectedVersion) {}
