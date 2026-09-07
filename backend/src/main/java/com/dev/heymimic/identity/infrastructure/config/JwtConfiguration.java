package com.dev.heymimic.identity.infrastructure.config;

import com.dev.heymimic.identity.infrastructure.security.ActiveSessionJwtValidator;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.JwtTypeValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
@EnableConfigurationProperties(SecurityTokenProperties.class)
public class JwtConfiguration {
  @Bean
  KeyPair jwtKeyPair(SecurityTokenProperties properties, Environment environment) {
    boolean privatePresent = !properties.getPrivateKey().isBlank();
    boolean publicPresent = !properties.getPublicKey().isBlank();
    if (privatePresent != publicPresent) {
      throw new IllegalStateException("Both JWT private and public keys must be configured");
    }
    if (privatePresent) return parseKeyPair(properties);
    if (environment.matchesProfiles("prod")) {
      throw new IllegalStateException("JWT keys are required in the prod profile");
    }
    return generateDevelopmentKeyPair();
  }

  @Bean
  JwtEncoder jwtEncoder(KeyPair jwtKeyPair) {
    return NimbusJwtEncoder.withKeyPair(
            (RSAPublicKey) jwtKeyPair.getPublic(), (RSAPrivateKey) jwtKeyPair.getPrivate())
        .algorithm(SignatureAlgorithm.RS256)
        .build();
  }

  @Bean
  JwtDecoder jwtDecoder(
      KeyPair jwtKeyPair,
      SecurityTokenProperties properties,
      ActiveSessionJwtValidator activeSessionValidator) {
    NimbusJwtDecoder decoder =
        NimbusJwtDecoder.withPublicKey((RSAPublicKey) jwtKeyPair.getPublic())
            .signatureAlgorithm(SignatureAlgorithm.RS256)
            .validateType(false)
            .build();
    decoder.setJwtValidator(
        new DelegatingOAuth2TokenValidator<>(
            new JwtTimestampValidator(Duration.ofSeconds(30)),
            new JwtIssuerValidator(properties.getIssuer()),
            new JwtClaimValidator<List<String>>(
                "aud",
                audiences -> audiences != null && audiences.contains(properties.getAudience())),
            new JwtTypeValidator("at+jwt"),
            activeSessionValidator));
    return decoder;
  }

  private KeyPair parseKeyPair(SecurityTokenProperties properties) {
    try {
      KeyFactory factory = KeyFactory.getInstance("RSA");
      var privateKey =
          (RSAPrivateKey)
              factory.generatePrivate(
                  new PKCS8EncodedKeySpec(Base64.getDecoder().decode(properties.getPrivateKey())));
      var publicKey =
          (RSAPublicKey)
              factory.generatePublic(
                  new X509EncodedKeySpec(Base64.getDecoder().decode(properties.getPublicKey())));
      return new KeyPair(publicKey, privateKey);
    } catch (Exception exception) {
      throw new IllegalStateException(
          "JWT keys must be Base64 PKCS#8 private and X.509 public keys", exception);
    }
  }

  private KeyPair generateDevelopmentKeyPair() {
    try {
      KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
      generator.initialize(2048);
      return generator.generateKeyPair();
    } catch (Exception exception) {
      throw new IllegalStateException("Could not generate development JWT key pair", exception);
    }
  }
}
