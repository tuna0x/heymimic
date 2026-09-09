package com.dev.heymimic.progress.api;

import com.dev.heymimic.progress.domain.MistakeStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateMistakeStatusRequest(
    @NotNull MistakeStatus status, @Min(0) long expectedVersion) {}
