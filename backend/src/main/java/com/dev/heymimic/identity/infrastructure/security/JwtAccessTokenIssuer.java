package com.dev.heymimic.identity.infrastructure.security;

import com.dev.heymimic.identity.application.port.AccessTokenIssuer;
import com.dev.heymimic.identity.application.port.IssuedAccessToken;
import com.dev.heymimic.identity.infrastructure.config.SecurityTokenProperties;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

@Component
public class JwtAccessTokenIssuer implements AccessTokenIssuer {
  private final JwtEncoder encoder;
  private final SecurityTokenProperties properties;

  public JwtAccessTokenIssuer(JwtEncoder encoder, SecurityTokenProperties properties) {
    this.encoder = encoder;
    this.properties = properties;
  }

  @Override
  public IssuedAccessToken issue(
      UUID userId, UUID sessionFamilyId, long authVersion, boolean verified, Instant issuedAt) {
    Instant expiresAt = issuedAt.plus(properties.getAccessTokenTtl());
    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer(properties.getIssuer())
            .audience(List.of(properties.getAudience()))
            .subject(userId.toString())
            .issuedAt(issuedAt)
            .notBefore(issuedAt)
            .expiresAt(expiresAt)
            .id(UUID.randomUUID().toString())
            .claim("sid", sessionFamilyId.toString())
            .claim("av", authVersion)
            .claim("verified", verified)
            .build();
    JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256).type("at+jwt").build();
    return new IssuedAccessToken(
        encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue(), expiresAt);
  }
}
