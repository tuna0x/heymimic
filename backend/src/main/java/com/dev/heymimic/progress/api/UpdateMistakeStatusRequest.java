package com.dev.heymimic.progress.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UpdateMistakeStatusRequest(@NotBlank String status, @Min(0) long expectedVersion) {}
