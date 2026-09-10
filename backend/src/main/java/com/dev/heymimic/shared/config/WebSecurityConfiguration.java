package com.dev.heymimic.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
public class WebSecurityConfiguration {
  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    CookieCsrfTokenRepository csrfRepository = new CookieCsrfTokenRepository();
    csrfRepository.setHeaderName("X-CSRF-TOKEN");
    csrfRepository.setCookieName("mimic_csrf");
    csrfRepository.setCookiePath("/api/v1");
    return http.csrf(
            csrf ->
                csrf.csrfTokenRepository(csrfRepository)
                    .withObjectPostProcessor(
                        new org.springframework.security.config.ObjectPostProcessor<
                            org.springframework.security.web.csrf.CsrfFilter>() {
                          @Override
                          public <O extends org.springframework.security.web.csrf.CsrfFilter>
                              O postProcess(O filter) {
                            // Browser mutations require CSRF even with a bearer token;
                            // resource-server defaults ignore it.
                            filter.setRequireCsrfProtectionMatcher(
                                org.springframework.security.web.csrf.CsrfFilter
                                    .DEFAULT_CSRF_MATCHER);
                            return filter;
                          }
                        }))
        .sessionManagement(
            sessions -> sessions.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            requests ->
                requests
                    .requestMatchers(
                        "/actuator/health",
                        "/actuator/info",
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/api/v1/auth/csrf",
                        "/api/v1/auth/register",
                        "/api/v1/auth/login",
                        "/api/v1/auth/refresh",
                        "/api/v1/auth/logout",
                        "/api/v1/auth/verify-email",
                        "/api/v1/auth/resend-verification",
                        "/api/v1/auth/forgot-password",
                        "/api/v1/auth/reset-password")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2ResourceServer(resourceServer -> resourceServer.jwt(jwt -> {}))
        .build();
  }
}
