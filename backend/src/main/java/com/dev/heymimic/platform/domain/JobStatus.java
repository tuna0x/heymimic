package com.dev.heymimic.platform.domain;

public enum JobStatus {
  PENDING,
  RUNNING,
  SUCCEEDED,
  FAILED_RETRYABLE,
  FAILED_FINAL
}
