package com.dev.heymimic.learner.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OnboardingRequest(
    @NotBlank @Pattern(regexp = "work|interview|casual|daily|other") String goal,
    @NotBlank @Pattern(regexp = "beginner|elementary|intermediate|unspecified")
        String selfAssessedLevel,
    int dailyMinutesGoal,
    @NotBlank @Size(max = 16) String targetLanguage,
    @NotBlank @Size(max = 64) String timezone) {}
