package com.dev.heymimic.learner.api;

import java.time.Instant;

public record QuotaUsageResponse(int limit, int used, int remaining, Instant resetAt) {}
