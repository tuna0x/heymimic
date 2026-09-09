package com.dev.heymimic.vocabulary.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AnalyzeContextRequest(
    @NotBlank @Size(max = 10000) String text,
    @NotBlank @Size(max = 16) @Pattern(regexp = "[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*")
        String targetLanguage) {}
