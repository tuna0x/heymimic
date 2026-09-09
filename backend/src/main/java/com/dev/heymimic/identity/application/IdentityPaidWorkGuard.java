package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.domain.UserStatus;
import com.dev.heymimic.platform.application.publicapi.PaidWorkGuard;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class IdentityPaidWorkGuard implements PaidWorkGuard {
  private final UserStore users;

  public IdentityPaidWorkGuard(UserStore users) {
    this.users = users;
  }

  @Override
  @Transactional(readOnly = true)
  public boolean canUsePaidWork(UUID userId) {
    return users
        .findById(userId)
        .map(user -> user.status() == UserStatus.ACTIVE && user.verifiedAt() != null)
        .orElse(false);
  }
}
