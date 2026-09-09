package com.dev.heymimic.speaking.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CompleteAttemptUploadRequest(
    @NotBlank
        @Pattern(
            regexp = "(?i)^[0-9a-f]{64}$",
            message = "checksumSha256 must be a 64-character hexadecimal SHA-256")
        String checksumSha256) {}
