package com.dev.heymimic.identity.application;

import com.dev.heymimic.identity.application.port.EmailTokenStore;
import com.dev.heymimic.identity.application.port.SessionStore;
import com.dev.heymimic.identity.application.port.UserStore;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdentityAccountDeletionFinalizer {
  private final EmailTokenStore emailTokens;
  private final SessionStore sessions;
  private final UserStore users;

  public IdentityAccountDeletionFinalizer(
      EmailTokenStore emailTokens, SessionStore sessions, UserStore users) {
    this.emailTokens = emailTokens;
    this.sessions = sessions;
    this.users = users;
  }

  @Transactional
  public void finalizeDeletion(UUID userId) {
    emailTokens.deleteAllForUser(userId);
    sessions.deleteAllForUser(userId);
    users.delete(userId);
  }
}
