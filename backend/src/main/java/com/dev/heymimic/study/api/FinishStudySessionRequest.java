package com.dev.heymimic.study.api;

import jakarta.validation.constraints.PositiveOrZero;

public record FinishStudySessionRequest(@PositiveOrZero long expectedVersion) {}
