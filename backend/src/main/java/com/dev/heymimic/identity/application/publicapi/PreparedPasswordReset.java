package com.dev.heymimic.identity.application.publicapi;

public record PreparedPasswordReset(String email, String token) {
  @Override
  public String toString() {
    return "PreparedPasswordReset[email=" + email + ", token=[REDACTED]]";
  }
}
