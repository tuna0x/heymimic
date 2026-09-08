package com.dev.heymimic.progress.application.port;

public interface DailyProjectionRebuilder {
  ProjectionRebuildRecord rebuild(String ruleVersion);
}
