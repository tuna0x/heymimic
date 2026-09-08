package com.dev.heymimic.identity.api;

import com.dev.heymimic.identity.application.publicapi.AuthTokens;
import com.dev.heymimic.identity.application.publicapi.IdentityAuthentication;
import com.dev.heymimic.identity.application.publicapi.LoginUser;
import com.dev.heymimic.identity.application.publicapi.PasswordRecoveryWorkflow;
import com.dev.heymimic.identity.application.publicapi.RegisterUser;
import com.dev.heymimic.identity.application.publicapi.UserRegistration;
import com.dev.heymimic.identity.application.publicapi.VerificationWorkflow;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.Duration;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private static final String REFRESH_COOKIE = "__Secure-mimic_refresh";
  private final UserRegistration registration;
  private final IdentityAuthentication authentication;
  private final VerificationWorkflow verification;
  private final PasswordRecoveryWorkflow passwordRecovery;

  public AuthController(
      UserRegistration registration,
      IdentityAuthentication authentication,
      VerificationWorkflow verification,
      PasswordRecoveryWorkflow passwordRecovery) {
    this.registration = registration;
    this.authentication = authentication;
    this.verification = verification;
    this.passwordRecovery = passwordRecovery;
  }

  @GetMapping("/csrf")
  ResponseEntity<CsrfResponse> csrf(CsrfToken csrfToken) {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .body(new CsrfResponse(csrfToken.getHeaderName(), csrfToken.getToken()));
  }

  @PostMapping("/register")
  ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
    var registered =
        registration.register(
            new RegisterUser(
                request.name(), request.email(), request.password(), request.timezone()));
    return ResponseEntity.created(URI.create("/api/v1/users/" + registered.userId()))
        .body(new RegisterResponse(registered.userId(), registered.verificationRequired()));
  }

  @PostMapping("/login")
  ResponseEntity<AuthResponse> login(
      @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
    AuthTokens tokens =
        authentication.login(
            new LoginUser(request.email(), request.password(), httpRequest.getRemoteAddr()));
    return authenticated(tokens);
  }

  @PostMapping("/refresh")
  ResponseEntity<AuthResponse> refresh(
      @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
    return authenticated(authentication.refresh(refreshToken));
  }

  @PostMapping("/logout")
  ResponseEntity<Void> logout(
      @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
    authentication.logout(refreshToken);
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
        .build();
  }

  @PostMapping("/change-password")
  ResponseEntity<Void> changePassword(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChangePasswordRequest request) {
    authentication.changePassword(
        UUID.fromString(jwt.getSubject()), request.currentPassword(), request.newPassword());
    return ResponseEntity.noContent()
        .header(HttpHeaders.SET_COOKIE, expiredRefreshCookie().toString())
        .build();
  }

  @PostMapping("/verify-email")
  ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
    verification.verify(request.token());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/resend-verification")
  ResponseEntity<AcceptedMessage> resendVerification(
      @Valid @RequestBody ResendVerificationRequest request, HttpServletRequest httpRequest) {
    verification.resend(request.email(), httpRequest.getRemoteAddr());
    return ResponseEntity.accepted()
        .body(
            new AcceptedMessage(
                "If an unverified account exists, a verification email will be sent"));
  }

  @PostMapping("/forgot-password")
  ResponseEntity<AcceptedMessage> forgotPassword(
      @Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
    passwordRecovery.requestReset(request.email(), httpRequest.getRemoteAddr());
    return ResponseEntity.accepted()
        .body(new AcceptedMessage("If the account exists, a password reset email will be sent"));
  }

  @PostMapping("/reset-password")
  ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    passwordRecovery.resetPassword(request.token(), request.newPassword());
    return ResponseEntity.noContent().build();
  }

  private ResponseEntity<AuthResponse> authenticated(AuthTokens tokens) {
    AuthResponse body =
        new AuthResponse(
            tokens.accessToken(),
            "Bearer",
            tokens.expiresInSeconds(),
            new AuthUserResponse(tokens.userId(), tokens.email(), tokens.verified()));
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())
        .header(HttpHeaders.SET_COOKIE, refreshCookie(tokens.refreshToken()).toString())
        .body(body);
  }

  private ResponseCookie refreshCookie(String value) {
    return ResponseCookie.from(REFRESH_COOKIE, value)
        .httpOnly(true)
        .secure(true)
        .sameSite("Lax")
        .path("/api/v1/auth")
        .maxAge(Duration.ofDays(30))
        .build();
  }

  private ResponseCookie expiredRefreshCookie() {
    return ResponseCookie.from(REFRESH_COOKIE, "")
        .httpOnly(true)
        .secure(true)
        .sameSite("Lax")
        .path("/api/v1/auth")
        .maxAge(Duration.ZERO)
        .build();
  }
}
