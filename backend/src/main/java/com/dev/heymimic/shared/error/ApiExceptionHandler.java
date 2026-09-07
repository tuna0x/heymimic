package com.dev.heymimic.shared.error;

import com.dev.heymimic.shared.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(RateLimitExceededException.class)
  ResponseEntity<ProblemDetail> handleRateLimit(
      RateLimitExceededException exception, HttpServletRequest request) {
    ProblemDetail body =
        problem(exception.status(), exception.code(), exception.getMessage(), request);
    return ResponseEntity.status(exception.status())
        .header("Retry-After", Integer.toString(exception.retryAfterSeconds()))
        .body(body);
  }

  @ExceptionHandler(RequestInProgressException.class)
  ResponseEntity<ProblemDetail> handleRequestInProgress(
      RequestInProgressException exception, HttpServletRequest request) {
    ProblemDetail body =
        problem(exception.status(), exception.code(), exception.getMessage(), request);
    return ResponseEntity.status(exception.status())
        .header("Retry-After", Integer.toString(exception.retryAfterSeconds()))
        .body(body);
  }

  @ExceptionHandler(ApiException.class)
  ProblemDetail handleApiException(ApiException exception, HttpServletRequest request) {
    return problem(exception.status(), exception.code(), exception.getMessage(), request);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ProblemDetail handleValidation(
      MethodArgumentNotValidException exception, HttpServletRequest request) {
    ProblemDetail problem =
        problem(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed", request);
    Map<String, String> errors = new LinkedHashMap<>();
    exception
        .getBindingResult()
        .getFieldErrors()
        .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
    problem.setProperty("fieldErrors", errors);
    return problem;
  }

  private ProblemDetail problem(
      HttpStatus status, String code, String detail, HttpServletRequest request) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
    problem.setType(
        URI.create("https://heymimic.com/problems/" + code.toLowerCase().replace('_', '-')));
    problem.setTitle(status.getReasonPhrase());
    problem.setInstance(URI.create(request.getRequestURI()));
    problem.setProperty("code", code);
    problem.setProperty("requestId", request.getAttribute(RequestIdFilter.ATTRIBUTE));
    return problem;
  }
}
