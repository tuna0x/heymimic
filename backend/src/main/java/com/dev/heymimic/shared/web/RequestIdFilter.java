package com.dev.heymimic.shared.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {
  public static final String HEADER = "X-Request-Id";
  public static final String ATTRIBUTE = "requestId";

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String candidate = request.getHeader(HEADER);
    String requestId =
        candidate != null && candidate.matches("[A-Za-z0-9_-]{8,100}")
            ? candidate
            : UUID.randomUUID().toString();
    request.setAttribute(ATTRIBUTE, requestId);
    response.setHeader(HEADER, requestId);
    try (MDC.MDCCloseable ignored = MDC.putCloseable(ATTRIBUTE, requestId)) {
      chain.doFilter(request, response);
    }
  }
}
