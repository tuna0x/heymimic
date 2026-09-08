package com.dev.heymimic.speaking.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record StartSpeakingSessionRequest(@NotNull UUID topicId) {}
