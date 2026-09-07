package com.dev.heymimic.identity.application.port;

import java.time.Instant;
import java.util.UUID;

public interface AccessTokenIssuer {
  IssuedAccessToken issue(
      UUID userId, UUID sessionFamilyId, long authVersion, boolean verified, Instant issuedAt);
}
