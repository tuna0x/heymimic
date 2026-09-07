package com.dev.heymimic.identity.application.publicapi;

public record LoginUser(String email, String password, String clientAddress) {
  @Override
  public String toString() {
    return "LoginUser[email=" + email + ", password=[REDACTED], clientAddress=[REDACTED]]";
  }
}
