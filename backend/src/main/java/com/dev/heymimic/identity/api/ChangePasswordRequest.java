package com.dev.heymimic.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank @Size(max = 128) String currentPassword,
    @NotNull @Size(min = 12, max = 128) String newPassword) {
  @Override
  public String toString() {
    return "ChangePasswordRequest[currentPassword=[REDACTED], newPassword=[REDACTED]]";
  }
}
