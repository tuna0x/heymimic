package com.dev.heymimic.shared.error;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.dev.heymimic.shared.web.RequestIdFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.mock.web.MockHttpServletRequest;

class ApiExceptionHandlerTest {

  private ApiExceptionHandler handler;
  private MockHttpServletRequest request;

  @BeforeEach
  void setUp() {
    handler = new ApiExceptionHandler();
    request = new MockHttpServletRequest();
    request.setRequestURI("/api/v1/test-endpoint");
    request.setAttribute(RequestIdFilter.ATTRIBUTE, "req-test-999");
  }

  @Test
  void handlesApiExceptionWithStructuredProblemDetail() {
    ApiException exception =
        new ApiException(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "Item was not found");

    ProblemDetail problem = handler.handleApiException(exception, request);

    assertNotNull(problem);
    assertEquals(HttpStatus.NOT_FOUND.value(), problem.getStatus());
    assertEquals("Item was not found", problem.getDetail());
    assertEquals("RESOURCE_NOT_FOUND", problem.getProperties().get("code"));
    assertEquals("req-test-999", problem.getProperties().get("requestId"));
    assertEquals("/api/v1/test-endpoint", problem.getInstance().getPath());
  }

  @Test
  void handlesUnauthorizedApiException() {
    ApiException exception =
        new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid credentials");

    ProblemDetail problem = handler.handleApiException(exception, request);

    assertNotNull(problem);
    assertEquals(HttpStatus.UNAUTHORIZED.value(), problem.getStatus());
    assertEquals("INVALID_CREDENTIALS", problem.getProperties().get("code"));
  }

  @Test
  void addsRetryAfterForRequestInProgress() {
    var response = handler.handleRequestInProgress(new RequestInProgressException(2), request);

    assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    assertEquals("2", response.getHeaders().getFirst("Retry-After"));
    assertNotNull(response.getBody());
    assertEquals("REQUEST_IN_PROGRESS", response.getBody().getProperties().get("code"));
  }

  @Test
  void addsRetryAfterForRateLimit() {
    var response = handler.handleRateLimit(new RateLimitExceededException(60), request);

    assertEquals(HttpStatus.TOO_MANY_REQUESTS, response.getStatusCode());
    assertEquals("60", response.getHeaders().getFirst("Retry-After"));
    assertNotNull(response.getBody());
    assertEquals("RATE_LIMIT_EXCEEDED", response.getBody().getProperties().get("code"));
  }
}
