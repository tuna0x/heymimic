package com.dev.heymimic.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank
        @Size(max = 320)
        @Pattern(
            regexp = "^\\s*[^\\s@]+@[^\\s@]+\\.[^\\s@]+\\s*$",
            message = "must be a well-formed email address")
        String email,
    @NotNull @Size(min = 12, max = 128) String password,
    @NotBlank @Size(max = 64) String timezone) {
  @Override
  public String toString() {
    return "RegisterRequest[name="
        + name
        + ", email="
        + email
        + ", password=[REDACTED], timezone="
        + timezone
        + "]";
  }
}
