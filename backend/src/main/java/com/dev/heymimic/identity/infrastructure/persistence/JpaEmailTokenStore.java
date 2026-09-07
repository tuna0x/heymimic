package com.dev.heymimic.identity.infrastructure.persistence;

import com.dev.heymimic.identity.application.port.EmailTokenRecord;
import com.dev.heymimic.identity.application.port.EmailTokenStore;
import com.dev.heymimic.identity.domain.EmailTokenPurpose;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaEmailTokenStore implements EmailTokenStore {
  private final JpaIdentityEmailTokenRepository repository;

  public JpaEmailTokenStore(JpaIdentityEmailTokenRepository repository) {
    this.repository = repository;
  }

  @Override
  public void replaceActive(
      UUID id,
      UUID userId,
      EmailTokenPurpose purpose,
      String tokenHash,
      Instant expiresAt,
      Instant now) {
    repository.consumeActive(userId, purpose, now);
    repository.saveAndFlush(
        new IdentityEmailTokenEntity(id, userId, purpose, tokenHash, expiresAt, now));
  }

  @Override
  public Optional<EmailTokenRecord> lockByHash(String tokenHash) {
    return repository.findByTokenHash(tokenHash).map(this::toRecord);
  }

  @Override
  public void consume(UUID id, Instant now) {
    IdentityEmailTokenEntity token = repository.findById(id).orElseThrow();
    token.consume(now);
  }

  private EmailTokenRecord toRecord(IdentityEmailTokenEntity token) {
    return new EmailTokenRecord(
        token.id(), token.userId(), token.purpose(), token.expiresAt(), token.consumedAt());
  }
}
