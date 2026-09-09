package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.domain.UserStatus;
import com.dev.heymimic.platform.application.publicapi.AccountWorkGuard;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class IdentityAccountWorkGuard implements AccountWorkGuard {
  private final UserStore users;

  public IdentityAccountWorkGuard(UserStore users) {
    this.users = users;
  }

  @Override
  @Transactional(readOnly = true)
  public boolean canStartWork(UUID userId) {
    return userId == null
        || users.findById(userId).map(user -> user.status() == UserStatus.ACTIVE).orElse(false);
  }
}
