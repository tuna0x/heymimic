package com.dev.heymimic.identity.infrastructure.persistence;

import com.dev.heymimic.identity.application.port.UserRecord;
import com.dev.heymimic.identity.application.port.UserStore;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class JpaUserStore implements UserStore {
  private final JpaIdentityUserRepository repository;

  public JpaUserStore(JpaIdentityUserRepository repository) {
    this.repository = repository;
  }

  @Override
  public boolean existsByEmail(String emailNormalized) {
    return repository.existsByEmailNormalized(emailNormalized);
  }

  @Override
  public UserRecord create(UUID id, String emailNormalized, String passwordHash, Instant now) {
    return toRecord(
        repository.saveAndFlush(new IdentityUserEntity(id, emailNormalized, passwordHash, now)));
  }

  @Override
  public Optional<UserRecord> findByEmail(String emailNormalized) {
    return repository.findByEmailNormalized(emailNormalized).map(this::toRecord);
  }

  @Override
  public Optional<UserRecord> findById(UUID id) {
    return repository.findById(id).map(this::toRecord);
  }

  @Override
  public void markVerified(UUID id, Instant now) {
    repository.findById(id).orElseThrow().verify(now);
  }

  @Override
  public void changePassword(UUID id, String passwordHash, Instant now) {
    repository.findById(id).orElseThrow().changePassword(passwordHash, now);
  }

  private UserRecord toRecord(IdentityUserEntity user) {
    return new UserRecord(
        user.id(),
        user.emailNormalized(),
        user.passwordHash(),
        user.status(),
        user.verifiedAt(),
        user.authVersion());
  }
}
