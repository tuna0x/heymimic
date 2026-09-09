package com.dev.heymimic.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(FeatureConfiguration.Properties.class)
public class FeatureConfiguration {
  @ConfigurationProperties("heymimic.features")
  public record Properties(
      boolean remediation,
      boolean contentPractice,
      boolean dailyPlan,
      boolean dialogue,
      boolean learningEvidence) {}
}
