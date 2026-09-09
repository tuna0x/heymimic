package com.dev.heymimic.speaking.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record CreateSpeakingAttemptRequest(@NotBlank String mimeType, @Positive long sizeBytes) {}
