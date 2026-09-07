package com.dev.heymimic.identity.application.publicapi;

public interface IdentityAuthentication {
  AuthTokens login(LoginUser command);

  AuthTokens refresh(String refreshToken);

  void logout(String refreshToken);
}
