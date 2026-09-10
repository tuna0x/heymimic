package com.dev.heymimic.peer.infrastructure.persistence;

import com.dev.heymimic.peer.application.PeerStore;
import com.dev.heymimic.platform.application.publicapi.AccountDataCleaner;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PeerAccountDataCleaner implements AccountDataCleaner {
  private final PeerStore store;

  public PeerAccountDataCleaner(PeerStore store) {
    this.store = store;
  }

  @Override
  public String cleanerName() {
    return "peer";
  }

  @Override
  public int order() {
    return 325;
  }

  @Override
  @Transactional
  public void clean(UUID userId, UUID deletionJobId) {
    store.deleteByUserId(userId);
  }
}
