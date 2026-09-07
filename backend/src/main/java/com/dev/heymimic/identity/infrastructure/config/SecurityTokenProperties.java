package com.dev.heymimic.identity.infrastructure.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("heymimic.security")
public class SecurityTokenProperties {
  private String issuer = "heymimic";
  private String audience = "heymimic-web";
  private Duration accessTokenTtl = Duration.ofMinutes(10);
  private String privateKey = "";
  private String publicKey = "";

  public String getIssuer() {
    return issuer;
  }

  public void setIssuer(String issuer) {
    this.issuer = issuer;
  }

  public String getAudience() {
    return audience;
  }

  public void setAudience(String audience) {
    this.audience = audience;
  }

  public Duration getAccessTokenTtl() {
    return accessTokenTtl;
  }

  public void setAccessTokenTtl(Duration accessTokenTtl) {
    this.accessTokenTtl = accessTokenTtl;
  }

  public String getPrivateKey() {
    return privateKey;
  }

  public void setPrivateKey(String privateKey) {
    this.privateKey = privateKey;
  }

  public String getPublicKey() {
    return publicKey;
  }

  public void setPublicKey(String publicKey) {
    this.publicKey = publicKey;
  }
}
