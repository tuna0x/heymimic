package com.dev.heymimic.platform.application.publicapi;

public interface JobHandler {
  String jobType();

  default boolean allowsInactiveOwner() {
    return false;
  }

  default void onFinalFailure(ClaimedJob job, String errorCode) {}

  void handle(ClaimedJob job) throws Exception;
}
