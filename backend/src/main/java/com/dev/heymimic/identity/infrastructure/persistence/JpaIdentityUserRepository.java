package com.dev.heymimic.identity.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface JpaIdentityUserRepository extends JpaRepository<IdentityUserEntity, UUID> {
  boolean existsByEmailNormalized(String emailNormalized);

  Optional<IdentityUserEntity> findByEmailNormalized(String emailNormalized);
}
