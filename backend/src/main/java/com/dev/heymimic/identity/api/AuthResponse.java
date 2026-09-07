package com.dev.heymimic.identity.api;

public record AuthResponse(
    String accessToken, String tokenType, long expiresIn, AuthUserResponse user) {
  @Override
  public String toString() {
    return "AuthResponse[accessToken=[REDACTED], tokenType="
        + tokenType
        + ", expiresIn="
        + expiresIn
        + ", user="
        + user
        + "]";
  }
}
