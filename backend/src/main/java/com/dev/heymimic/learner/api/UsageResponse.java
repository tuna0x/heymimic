package com.dev.heymimic.learner.api;

import java.util.Map;

public record UsageResponse(Map<String, QuotaUsageResponse> operations) {}
