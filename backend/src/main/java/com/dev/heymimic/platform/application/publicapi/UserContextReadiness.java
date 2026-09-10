package com.dev.heymimic.platform.application.publicapi;

public record UserContextReadiness(long currentRevision, long readyThrough, boolean blocked) {
  public boolean isReady(long revision) {
    return !blocked && revision >= 0 && revision <= readyThrough;
  }
}
