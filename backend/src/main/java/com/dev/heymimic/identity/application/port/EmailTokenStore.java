package com.dev.heymimic.identity.application.port;

import com.dev.heymimic.identity.domain.EmailTokenPurpose;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface EmailTokenStore {
  void replaceActive(
      UUID id,
      UUID userId,
      EmailTokenPurpose purpose,
      String tokenHash,
      Instant expiresAt,
      Instant now);

  Optional<EmailTokenRecord> lockByHash(String tokenHash);

  void consume(UUID id, Instant now);

  void deleteAllForUser(UUID userId);
}
