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
    return http.csrf(csrf -> csrf.csrfTokenRepository(csrfRepository))
        .sessionManagement(
            sessions -> sessions.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            requests ->
                requests
                    .requestMatchers("/actuator/health", "/actuator/info", "/api/v1/auth/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2ResourceServer(resourceServer -> resourceServer.jwt(jwt -> {}))
        .build();
  }
}
