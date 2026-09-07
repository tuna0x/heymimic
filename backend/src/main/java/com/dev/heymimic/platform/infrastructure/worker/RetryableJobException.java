package com.dev.heymimic.platform.infrastructure.worker;

public class RetryableJobException extends RuntimeException {
  private final String errorCode;

  public RetryableJobException(String errorCode, String message, Throwable cause) {
    super(message, cause);
    this.errorCode = errorCode;
  }

  public String errorCode() {
    return errorCode;
  }
}
