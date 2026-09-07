# ADR 0003: Idempotency and quota guards

- Status: Accepted
- Date: 2026-09-07
- Scope: B01 request idempotency and paid-work quota primitives

## Context

Browser retries, double clicks and concurrent tabs can submit the same mutation more than once.
AI and transcription operations also require a quota reservation before a durable job is created.
These guarantees must hold across multiple monolith instances, not only within one JVM.

## Decision: idempotency

- The scope key is `(user_id, operation, idempotency_key)` and the key is a client-generated UUID.
- The caller supplies a deterministic canonical request representation. The platform stores its
  SHA-256 hash, not the original request.
- `IdempotencyExecutor` inserts the placeholder, invokes the business operation and stores the HTTP
  status/body in one transaction. A business exception rolls back all three effects.
- The same key and hash replays the committed response without executing the supplied operation.
  The same key with another hash returns `409 IDEMPOTENCY_KEY_REUSED`.
- A competing request may wait at most two seconds for the unique-key owner. The lock timeout is
  reset before business logic executes, so unrelated domain locks retain PostgreSQL defaults.
- Expired records can be atomically replaced. Default endpoint policy remains 24 hours; callers
  pass the platform-approved TTL, never a value received directly from the browser.
- Authentication tokens and secrets must never be placed in the stored response body.

## Decision: quota

- Quota is reserved against `(user, quota kind, UTC date)`. A PostgreSQL transaction advisory lock
  serializes calculation and insertion for that bucket.
- `RESERVED` and `CONSUMED` amounts count toward the daily limit. `RELEASED` amounts do not.
- A unique `(resource_id, quota_kind)` reservation makes job retries idempotent. Replaying the same
  reservation returns its existing ID.
- Limits come from validated `heymimic.quotas.daily-limits` configuration. A command cannot provide
  or increase its own limit. Missing policy fails closed.
- `consume` and `release` are owner-scoped and idempotent for the same terminal state. A conflicting
  terminal transition returns a stable conflict error.

## Consequences

The guarantees depend on callers entering through the Spring transactional service proxy. Domain
services should wrap their complete mutation with `IdempotencyExecutor`; they must not call it from
self-invocation. Quota reservation and job enqueue must occur in the same outer transaction so a
failed enqueue does not spend quota.

PostgreSQL JSONB normalizes response whitespace. API behavior therefore treats stored bodies as
JSON values rather than byte-identical text.
