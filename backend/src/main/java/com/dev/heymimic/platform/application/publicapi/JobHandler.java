package com.dev.heymimic.platform.application.publicapi;

public interface JobHandler {
  String jobType();

  void handle(ClaimedJob job) throws Exception;
}
