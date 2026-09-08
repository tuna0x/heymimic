package com.dev.heymimic.progress.application;

import com.dev.heymimic.progress.application.port.DailyProjectionRebuilder;
import com.dev.heymimic.progress.application.publicapi.ProgressProjectionMaintenance;
import com.dev.heymimic.progress.application.publicapi.ProjectionRebuildView;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class ProgressProjectionMaintenanceService implements ProgressProjectionMaintenance {
  private static final Pattern RULE_VERSION = Pattern.compile("[a-z0-9][a-z0-9.-]{0,31}");
  private final DailyProjectionRebuilder rebuilder;

  public ProgressProjectionMaintenanceService(DailyProjectionRebuilder rebuilder) {
    this.rebuilder = rebuilder;
  }

  @Override
  public ProjectionRebuildView rebuildDaily(String ruleVersion) {
    if (ruleVersion == null || !RULE_VERSION.matcher(ruleVersion).matches()) {
      throw new IllegalArgumentException(
          "Projection rule version must contain 1-32 lowercase letters, digits, dots or hyphens");
    }
    var result = rebuilder.rebuild(ruleVersion);
    return new ProjectionRebuildView(
        result.generationId(),
        result.ruleVersion(),
        result.sourceRows(),
        result.sourceSeconds(),
        result.projectedDays(),
        result.sourceWatermark(),
        result.activatedAt());
  }
}
