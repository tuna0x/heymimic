package com.dev.heymimic.platform.application.publicapi;

public interface EventDeliveryReplay {
  DeliveryReplayResult replay(DeliveryReplayCommand command);
}
