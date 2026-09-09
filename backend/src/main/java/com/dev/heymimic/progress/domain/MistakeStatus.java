package com.dev.heymimic.progress.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(enumAsRef = true)
public enum MistakeStatus {
  ACTIVE,
  RESOLVED,
  IGNORED;

  @JsonValue
  public String apiValue() {
    return name().toLowerCase(java.util.Locale.ROOT);
  }

  @JsonCreator
  public static MistakeStatus fromApiValue(String value) {
    for (MistakeStatus status : values()) {
      if (status.apiValue().equalsIgnoreCase(value)) return status;
    }
    throw new IllegalArgumentException("Unknown mistake status: " + value);
  }
}
