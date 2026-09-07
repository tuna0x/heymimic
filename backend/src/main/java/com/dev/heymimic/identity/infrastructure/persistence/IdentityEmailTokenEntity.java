package com.dev.heymimic.identity.infrastructure.persistence;

import com.dev.heymimic.identity.domain.EmailTokenPurpose;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "identity_email_tokens")
class IdentityEmailTokenEntity {
  @Id private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private EmailTokenPurpose purpose;

  @Column(name = "token_hash", nullable = false, length = 64, unique = true)
  private String tokenHash;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "consumed_at")
  private Instant consumedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected IdentityEmailTokenEntity() {}

  IdentityEmailTokenEntity(
      UUID id,
      UUID userId,
      EmailTokenPurpose purpose,
      String tokenHash,
      Instant expiresAt,
      Instant createdAt) {
    this.id = id;
    this.userId = userId;
    this.purpose = purpose;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
  }

  void consume(Instant now) {
    this.consumedAt = now;
  }

  UUID id() {
    return id;
  }

  UUID userId() {
    return userId;
  }

  EmailTokenPurpose purpose() {
    return purpose;
  }

  Instant expiresAt() {
    return expiresAt;
  }

  Instant consumedAt() {
    return consumedAt;
  }
}
