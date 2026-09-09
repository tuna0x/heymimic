package com.dev.heymimic.learner.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(min = 1, max = 100) String name,
    @Pattern(regexp = "work|interview|casual|daily|other") String goal,
    Integer dailyMinutesGoal,
    @Size(min = 1, max = 64) String timezone,
    @NotNull @PositiveOrZero Long expectedVersion) {}
