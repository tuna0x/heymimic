package com.dev.heymimic.platform.application.publicapi;

public class JobLeaseLostException extends RuntimeException {
  public JobLeaseLostException() {
    super("The job execution lease is no longer valid");
  }
}
