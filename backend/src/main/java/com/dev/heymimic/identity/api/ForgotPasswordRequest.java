package com.dev.heymimic.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ForgotPasswordRequest(
    @NotBlank
        @Size(max = 320)
        @Pattern(
            regexp = "^\\s*[^\\s@]+@[^\\s@]+\\.[^\\s@]+\\s*$",
            message = "must be a well-formed email address")
        String email) {}
