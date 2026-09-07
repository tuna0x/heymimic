package com.dev.heymimic.platform.application.port;

import java.util.UUID;

public record IdempotencyRecord(
    UUID id, String requestHash, Integer responseStatus, String responseBodyJson) {
  public boolean isComplete() {
    return responseStatus != null;
  }
}
