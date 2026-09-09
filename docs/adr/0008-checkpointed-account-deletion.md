# ADR 0008: Checkpointed account deletion

- Status: Accepted
- Date: 2026-09-07

## Context

Deleting an account spans identity, learner and platform-owned data. A single large transaction
cannot safely include future object-storage deletion, and a worker can crash between module cleanup
steps. Normal jobs are blocked once an account becomes inactive, but the deletion maintenance job
must still run for an account in `DELETING` state.

## Decision

- `DELETE /api/v1/me` requires Bearer authentication, CSRF, the current password and the literal
  confirmation `DELETE`.
- The request transaction changes the account to `DELETING`, increments `authVersion`, revokes all
  session families, enqueues one `DELETE_ACCOUNT` job and creates a deletion tombstone.
- Account-owned workers are rejected by `AccountWorkGuard`. `JobHandler.allowsInactiveOwner()` is
  false by default and is enabled only by the account-deletion maintenance handler.
- Modules contribute idempotent `AccountDataCleaner` implementations. The deletion handler runs
  them by explicit order and records a `(user_id, step)` checkpoint after each successful cleaner.
  A crash between cleaning and checkpointing may repeat that cleaner, so repeat/not-found must be
  treated as success.
- The platform cleaner waits while another user-owned job is `RUNNING`, purges pending/finished
  platform records, and anonymizes the deletion job payload and owner. The immutable resource ID is
  sufficient to resume the tombstone workflow.
- Learner data is removed before identity tokens and the identity root. The final tombstone has no
  foreign key to the deleted user and records completion time.

## Consequences

- Every future user-data module must register a cleaner with a stable unique name and correct order.
- Provider/object cleaners may be retried and must regard remote not-found responses as success.
- Tombstone retention cleanup is release-hardening work; the intended retention is 30 days.
- PostgreSQL integration tests cover the migration, foreign-key order, session invalidation and
  physical deletion when Docker/Testcontainers is available.
