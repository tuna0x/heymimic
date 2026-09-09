package com.dev.heymimic.identity.application.publicapi;

import java.util.UUID;

public interface IdentityAuthentication {
  AuthTokens login(LoginUser command);

  AuthTokens refresh(String refreshToken);

  void logout(String refreshToken);

  void changePassword(UUID userId, String currentPassword, String newPassword);
}
