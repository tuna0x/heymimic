package com.dev.heymimic.platform.application;

import com.dev.heymimic.platform.application.port.IdempotencyRecord;
import com.dev.heymimic.platform.application.port.IdempotencyStore;
import com.dev.heymimic.platform.application.publicapi.IdempotencyCommand;
import com.dev.heymimic.platform.application.publicapi.IdempotencyExecutor;
import com.dev.heymimic.platform.application.publicapi.IdempotentResponse;
import com.dev.heymimic.shared.error.ApiException;
import com.dev.heymimic.shared.error.RequestInProgressException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformIdempotencyService implements IdempotencyExecutor {
  private final IdempotencyStore store;
  private final Clock clock;

  public PlatformIdempotencyService(IdempotencyStore store, Clock clock) {
    this.store = store;
    this.clock = clock;
  }

  @Override
  @Transactional
  public IdempotentResponse execute(
      IdempotencyCommand command, Supplier<IdempotentResponse> businessOperation) {
    Instant now = clock.instant();
    UUID proposedId = UUID.randomUUID();
    String requestHash = sha256(command.canonicalRequest());
    IdempotencyRecord record;
    try {
      record =
          store.begin(
              proposedId,
              command.userId(),
              command.operation(),
              command.idempotencyKey(),
              requestHash,
              now,
              now.plus(command.ttl()));
    } catch (CannotAcquireLockException exception) {
      throw new RequestInProgressException(2);
    }

    if (!record.requestHash().equals(requestHash)) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "IDEMPOTENCY_KEY_REUSED",
          "The idempotency key was already used for a different request");
    }
    if (!record.id().equals(proposedId)) {
      if (!record.isComplete()) {
        throw new RequestInProgressException(2);
      }
      return new IdempotentResponse(record.responseStatus(), record.responseBodyJson(), false)
          .asReplay();
    }

    IdempotentResponse response = businessOperation.get();
    if (response.replayed()) {
      throw new IllegalArgumentException("business operation must return a fresh response");
    }
    store.complete(record.id(), response.status(), response.bodyJson());
    return response;
  }

  private String sha256(String value) {
    try {
      byte[] digest =
          MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest);
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is unavailable", exception);
    }
  }
}
