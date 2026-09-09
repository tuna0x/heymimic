package com.dev.heymimic.learner.api;

import com.dev.heymimic.platform.application.publicapi.QuotaLimits;
import com.dev.heymimic.shared.config.FeatureConfiguration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class CapabilityController {
  private final FeatureConfiguration.Properties features;
  private final QuotaLimits quotas;

  public CapabilityController(FeatureConfiguration.Properties features, QuotaLimits quotas) {
    this.features = features;
    this.quotas = quotas;
  }

  @GetMapping("/capabilities")
  CapabilitiesResponse get() {
    var capabilities = new LinkedHashMap<String, FeatureCapabilityResponse>();
    capabilities.put("remediation", capability(features.remediation()));
    capabilities.put("contentPractice", capability(features.contentPractice()));
    capabilities.put("dailyPlan", capability(features.dailyPlan()));
    capabilities.put("dialogue", capability(features.dialogue()));
    capabilities.put("learningEvidence", capability(features.learningEvidence()));
    return new CapabilitiesResponse(Map.copyOf(capabilities), quotas.dailyLimits());
  }

  private FeatureCapabilityResponse capability(boolean enabled) {
    return new FeatureCapabilityResponse(enabled, enabled ? "enabled" : "rollout_disabled");
  }
}
