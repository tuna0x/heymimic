package com.dev.heymimic.study.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.UUID;

public record ComposeDailyPlanRequest(@Min(5) @Max(15) Integer goalMinutes, UUID sourceBriefId) {}
