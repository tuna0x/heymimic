package com.dev.heymimic.identity.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface UserStore {
  boolean existsByEmail(String emailNormalized);

  UserRecord create(UUID id, String emailNormalized, String passwordHash, Instant now);

  Optional<UserRecord> findByEmail(String emailNormalized);

  Optional<UserRecord> findById(UUID id);

  void markVerified(UUID id, Instant now);

  void changePassword(UUID id, String passwordHash, Instant now);

  void requestDeletion(UUID id, Instant now);

  void delete(UUID id);
}
