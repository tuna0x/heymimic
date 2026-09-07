package com.dev.heymimic.identity.infrastructure.persistence;

import com.dev.heymimic.identity.domain.EmailTokenPurpose;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface JpaIdentityEmailTokenRepository extends JpaRepository<IdentityEmailTokenEntity, UUID> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  Optional<IdentityEmailTokenEntity> findByTokenHash(String tokenHash);

  @Modifying
  @Query(
      """
      update IdentityEmailTokenEntity token set token.consumedAt = :now
      where token.userId = :userId and token.purpose = :purpose and token.consumedAt is null
      """)
  int consumeActive(
      @Param("userId") UUID userId,
      @Param("purpose") EmailTokenPurpose purpose,
      @Param("now") Instant now);
}
