package com.dev.heymimic.identity.application.publicapi;

import java.util.UUID;

public record AuthTokens(
    String accessToken,
    long expiresInSeconds,
    String refreshToken,
    UUID userId,
    String email,
    boolean verified) {
  @Override
  public String toString() {
    return "AuthTokens[accessToken=[REDACTED], expiresInSeconds="
        + expiresInSeconds
        + ", refreshToken=[REDACTED], userId="
        + userId
        + ", email="
        + email
        + ", verified="
        + verified
        + "]";
  }
}
