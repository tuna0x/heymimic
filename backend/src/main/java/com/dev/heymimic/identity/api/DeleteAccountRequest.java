package com.dev.heymimic.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DeleteAccountRequest(
    @NotBlank @Size(max = 128) String currentPassword,
    @NotBlank @Pattern(regexp = "DELETE") String confirmation) {
  @Override
  public String toString() {
    return "DeleteAccountRequest[currentPassword=[REDACTED], confirmation=" + confirmation + "]";
  }
}
