package com.dev.heymimic.platform.domain;

public enum DeliveryStatus {
  PENDING,
  RUNNING,
  SUCCEEDED,
  FAILED_RETRYABLE,
  FAILED_FINAL
}
