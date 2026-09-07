package com.dev.heymimic.shared.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestIdFilterTest {

  private RequestIdFilter filter;
  private MockHttpServletRequest request;
  private MockHttpServletResponse response;
  private MockFilterChain chain;

  @BeforeEach
  void setUp() {
    filter = new RequestIdFilter();
    request = new MockHttpServletRequest();
    response = new MockHttpServletResponse();
    chain = new MockFilterChain();
  }

  @Test
  void generatesNewRequestIdWhenHeaderIsMissing() throws ServletException, IOException {
    filter.doFilter(request, response, chain);

    String responseHeader = response.getHeader(RequestIdFilter.HEADER);
    assertNotNull(responseHeader, "X-Request-Id header should be set in response");
    assertTrue(
        responseHeader.length() >= 8, "Generated request ID should be at least 8 characters");

    Object attr = request.getAttribute(RequestIdFilter.ATTRIBUTE);
    assertNotNull(attr, "requestId attribute should be set in request");
    assertEquals(responseHeader, attr.toString());
  }

  @Test
  void preservesValidExistingRequestId() throws ServletException, IOException {
    String incomingId = "custom-client-req-id-12345678";
    request.addHeader(RequestIdFilter.HEADER, incomingId);

    filter.doFilter(request, response, chain);

    assertEquals(incomingId, response.getHeader(RequestIdFilter.HEADER));
    assertEquals(incomingId, request.getAttribute(RequestIdFilter.ATTRIBUTE));
  }

  @Test
  void regeneratesRequestIdWhenHeaderContainsInvalidCharacters()
      throws ServletException, IOException {
    request.addHeader(RequestIdFilter.HEADER, "bad id with spaces!");

    filter.doFilter(request, response, chain);

    String responseHeader = response.getHeader(RequestIdFilter.HEADER);
    assertNotNull(responseHeader);
    assertTrue(
        responseHeader.matches("[A-Za-z0-9_-]{8,100}"),
        "Generated requestId should match required pattern");
  }
}
