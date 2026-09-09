package com.dev.heymimic.identity.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SessionStore {
  void create(
      UUID familyId,
      UUID tokenId,
      UUID userId,
      String tokenHash,
      Instant familyExpiresAt,
      Instant tokenExpiresAt,
      Instant now);

  RotationResult rotate(
      String tokenHash,
      UUID successorId,
      String successorHash,
      Instant successorExpiresAt,
      Instant now);

  Optional<UUID> revokeFamilyByTokenHash(String tokenHash, Instant now);

  void revokeAllForUser(UUID userId, Instant now);

  void deleteAllForUser(UUID userId);

  boolean isFamilyActive(UUID familyId, UUID userId, Instant now);
}
