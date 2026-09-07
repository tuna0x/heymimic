package com.dev.heymimic.platform.application.publicapi;

import java.util.UUID;

public interface OutboxPublisher {
  UUID publish(PublishEvent event);
}
