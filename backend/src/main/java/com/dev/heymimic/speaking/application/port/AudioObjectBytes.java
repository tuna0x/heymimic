package com.dev.heymimic.speaking.application.port;

public record AudioObjectBytes(byte[] content, String mimeType, String objectVersion) {
  public AudioObjectBytes {
    if (content == null) throw new IllegalArgumentException("Audio content is required");
  }
}
