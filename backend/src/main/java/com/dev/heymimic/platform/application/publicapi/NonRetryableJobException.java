package com.dev.heymimic.platform.application.publicapi;

public class NonRetryableJobException extends RuntimeException {
  private final String errorCode;

  public NonRetryableJobException(String errorCode, String message, Throwable cause) {
    super(message, cause);
    this.errorCode = errorCode;
  }

  public String errorCode() {
    return errorCode;
  }
}
