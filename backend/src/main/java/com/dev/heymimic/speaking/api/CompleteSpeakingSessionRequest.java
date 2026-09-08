package com.dev.heymimic.speaking.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.UUID;

public record CompleteSpeakingSessionRequest(
    @NotNull UUID selectedAttemptId, @PositiveOrZero long expectedVersion) {}
