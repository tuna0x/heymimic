package com.dev.heymimic.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequest(@NotBlank @Size(max = 256) String token) {
  @Override
  public String toString() {
    return "VerifyEmailRequest[token=[REDACTED]]";
  }
}
