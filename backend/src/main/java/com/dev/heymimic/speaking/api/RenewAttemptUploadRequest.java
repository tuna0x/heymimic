package com.dev.heymimic.speaking.api;

import jakarta.validation.constraints.PositiveOrZero;

public record RenewAttemptUploadRequest(@PositiveOrZero long expectedVersion) {}
