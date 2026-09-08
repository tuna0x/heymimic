package com.dev.heymimic.speaking.api;

import jakarta.validation.constraints.PositiveOrZero;

public record FinishSpeakingSessionRequest(@PositiveOrZero long expectedVersion) {}
