package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.UserStore;
import com.dev.heymimic.identity.application.publicapi.IdentityAccount;
import com.dev.heymimic.identity.application.publicapi.IdentityAccountReader;
import com.dev.heymimic.shared.error.ApiException;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdentityAccountQueryService implements IdentityAccountReader {
  private final UserStore users;

  public IdentityAccountQueryService(UserStore users) {
    this.users = users;
  }

  @Override
  @Transactional(readOnly = true)
  public IdentityAccount get(UUID userId) {
    var user =
        users
            .findById(userId)
            .orElseThrow(
                () -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
    return new IdentityAccount(user.id(), user.emailNormalized(), user.verifiedAt() != null);
  }
}
