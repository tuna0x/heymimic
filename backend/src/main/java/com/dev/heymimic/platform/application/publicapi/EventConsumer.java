package com.dev.heymimic.platform.application.publicapi;

public interface EventConsumer {
  String consumerName();

  String eventType();

  void consume(PublishedEvent event) throws Exception;
}
