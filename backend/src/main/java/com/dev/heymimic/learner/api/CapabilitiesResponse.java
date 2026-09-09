package com.dev.heymimic.learner.api;

import java.util.Map;

public record CapabilitiesResponse(
    Map<String, FeatureCapabilityResponse> features, Map<String, Integer> limits) {}
