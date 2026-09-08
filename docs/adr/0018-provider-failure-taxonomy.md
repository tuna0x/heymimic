# ADR 0018: Provider failure taxonomy and terminal jobs

- Status: Accepted
- Date: 2026-09-08

## Context

The job worker previously retried every unexpected exception until its retry budget was exhausted.
That is safe for transient outages but wasteful for invalid credentials, rejected requests and
schema-invalid provider responses. Provider messages and vendor-specific codes are also unsuitable
as stable API or database error codes.

Applying a timeout around the handler with a separate future would release the job lease while the
underlying HTTP call might still be running. Concrete outbound adapters are the only layer that can
reliably cancel or bound their own network request.

## Decision

- Platform exposes both `RetryableJobException` and `NonRetryableJobException` through its
  application public API. A non-retryable exception invokes the handler's final-failure callback
  and marks the job `FAILED_FINAL` immediately, regardless of remaining attempts.
- Speaking provider adapters throw `SpeakingProviderException` with one controlled reason:
  `TIMEOUT`, `RATE_LIMITED`, `UNAVAILABLE`, `AUTHENTICATION_FAILED` or
  `REQUEST_REJECTED`. The first three are retryable; the last two are terminal.
- The speaking job handler, not the adapter, creates persisted codes by combining the stage and
  reason. Examples are `STT_TIMEOUT`, `FEEDBACK_RATE_LIMITED` and
  `STT_AUTHENTICATION_FAILED`. Vendor error text remains only in exception logs.
- A transcript or feedback payload rejected by application schema validation is terminal with
  `STT_INVALID_RESPONSE` or `FEEDBACK_INVALID_RESPONSE`.
- Concrete HTTP adapters must configure connection and response timeouts on their HTTP client,
  cancel the request according to that client's contract, and translate timeout exceptions to
  `TIMEOUT`. The worker does not wrap provider calls in an additional asynchronous timeout.
- Unclassified implementation exceptions retain the existing `UNEXPECTED_ERROR` retry behavior,
  allowing recovery from accidental transient defects while surfacing missing adapter mappings.

## Consequences

- Rate limits, timeouts and service outages continue with bounded platform backoff.
- Bad credentials, rejected inputs and invalid responses stop immediately and expose stable error
  codes to polling clients.
- Final failure still runs the speaking workflow callback, so attempt/evaluation state and quota
  reservation are finalized consistently.
- Selecting a real STT/feedback vendor remains a B10 deployment decision; its adapter must prove
  timeout and mapping behavior with integration tests before production enablement.
