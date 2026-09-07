package com.dev.heymimic.identity.infrastructure.persistence;

import com.dev.heymimic.identity.domain.UserStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "identity_users")
class IdentityUserEntity {
  @Id private UUID id;

  @Column(name = "email_normalized", nullable = false, length = 320, unique = true)
  private String emailNormalized;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private UserStatus status;

  @Column(name = "verified_at")
  private Instant verifiedAt;

  @Column(name = "auth_version", nullable = false)
  private long authVersion;

  @Column(name = "deletion_requested_at")
  private Instant deletionRequestedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected IdentityUserEntity() {}

  IdentityUserEntity(UUID id, String emailNormalized, String passwordHash, Instant now) {
    this.id = id;
    this.emailNormalized = emailNormalized;
    this.passwordHash = passwordHash;
    this.status = UserStatus.ACTIVE;
    this.authVersion = 0;
    this.createdAt = now;
    this.updatedAt = now;
  }

  UUID id() {
    return id;
  }

  String emailNormalized() {
    return emailNormalized;
  }

  String passwordHash() {
    return passwordHash;
  }

  UserStatus status() {
    return status;
  }

  Instant verifiedAt() {
    return verifiedAt;
  }

  long authVersion() {
    return authVersion;
  }

  void verify(Instant now) {
    if (verifiedAt == null) {
      verifiedAt = now;
      updatedAt = now;
    }
  }

  void changePassword(String newPasswordHash, Instant now) {
    passwordHash = newPasswordHash;
    authVersion++;
    updatedAt = now;
  }
}
