package com.dev.heymimic.identity.application.port;

import java.util.UUID;

public record RotationResult(RotationStatus status, UUID userId, UUID familyId) {
  public static RotationResult invalid() {
    return new RotationResult(RotationStatus.INVALID, null, null);
  }

  public static RotationResult reused(UUID userId, UUID familyId) {
    return new RotationResult(RotationStatus.REUSED, userId, familyId);
  }

  public static RotationResult rotated(UUID userId, UUID familyId) {
    return new RotationResult(RotationStatus.ROTATED, userId, familyId);
  }
}
