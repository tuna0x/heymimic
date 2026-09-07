package com.dev.heymimic.identity.infrastructure.email;

import com.dev.heymimic.identity.application.port.IdentityEmailSender;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile({"dev", "test"})
public class InMemoryIdentityEmailSender implements IdentityEmailSender {
  private final ConcurrentHashMap<String, String> verificationTokens = new ConcurrentHashMap<>();
  private final ConcurrentHashMap<String, String> passwordResetTokens = new ConcurrentHashMap<>();

  @Override
  public void sendVerification(String email, String token) {
    verificationTokens.put(email, token);
  }

  public Optional<String> lastVerificationToken(String email) {
    return Optional.ofNullable(verificationTokens.get(email));
  }

  @Override
  public void sendPasswordReset(String email, String token) {
    passwordResetTokens.put(email, token);
  }

  public Optional<String> lastPasswordResetToken(String email) {
    return Optional.ofNullable(passwordResetTokens.get(email));
  }
}
