# ADR 0015: Speaking evaluation resource and enqueue boundary

- Status: Accepted
- Date: 2026-09-08

## Context

Speaking transcription and feedback can exceed an HTTP timeout and consume paid-provider quota.
Evaluation therefore needs a durable resource that survives reloads and a job whose creation is
atomic with quota reservation and attempt state. It must also be impossible to create two paid
evaluations for one attempt by changing an idempotency key.

## Decision

- Migration V10 creates `speaking_evaluations` and `speaking_feedback_items`. One evaluation is
  allowed per attempt. The evaluation persists status, processing stage, transcript/result slots,
  source, job and quota IDs, retryability, provider-invocation state and optimistic version.
- `POST /api/v1/speaking/attempts/{id}/evaluate` requires an authenticated account allowed to use
  paid work, a UUID `Idempotency-Key`, an owned immutable `AVAILABLE` audio object that has not
  expired, and an `IN_PROGRESS` session. It returns `202`, `Location`, `Retry-After: 2` and the
  queued evaluation view.
- Session locking serializes evaluation creation within a speaking session. The unique attempt
  constraint remains the final domain guard after idempotency records expire. Repeating the domain
  command with a new key returns the existing evaluation without reserving quota or enqueueing a
  second job.
- Quota reservation, job enqueue, evaluation insert, attempt transition to `QUEUED`, and the
  idempotency response share one database transaction.
- `GET /api/v1/speaking/attempts/{id}/evaluation` is owner-scoped and exposes explicit status,
  stage, retryability and nullable result/error fields for polling and reload recovery.
- A registered job handler prevents the platform worker from treating the new type as unknown and
  delegates staged provider execution through the workflow described by ADR 0016.
- Account deletion removes feedback and evaluations before attempts and sessions.

## Consequences

- The HTTP request never waits for STT or feedback.
- Users cannot bypass per-attempt uniqueness or daily quota with different idempotency keys.
- Provider calls remain outside database transactions; persisted stage is the recovery checkpoint.
- V10 and its JPA mappings require PostgreSQL integration verification when Docker is available.
