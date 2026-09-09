package com.dev.heymimic.identity.api;

import com.dev.heymimic.identity.application.publicapi.AccountDeletion;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class AccountLifecycleController {
  private static final String REFRESH_COOKIE = "__Secure-mimic_refresh";
  private final AccountDeletion deletion;

  public AccountLifecycleController(AccountDeletion deletion) {
    this.deletion = deletion;
  }

  @DeleteMapping
  ResponseEntity<Void> delete(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody DeleteAccountRequest request) {
    deletion.request(UUID.fromString(jwt.getSubject()), request.currentPassword());
    return ResponseEntity.accepted()
        .header(
            HttpHeaders.SET_COOKIE,
            ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(0)
                .build()
                .toString())
        .build();
  }
}
