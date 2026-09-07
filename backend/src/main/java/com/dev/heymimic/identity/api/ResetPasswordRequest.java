package com.dev.heymimic.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank @Size(max = 256) String token,
    @NotNull @Size(min = 12, max = 128) String newPassword) {
  @Override
  public String toString() {
    return "ResetPasswordRequest[token=[REDACTED], newPassword=[REDACTED]]";
  }
}
