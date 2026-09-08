# ADR 0023: Versioned progress projection rebuild

- Status: Accepted
- Date: 2026-09-08

## Context

Daily aggregation rules will evolve. Replaying providers or learning events is unsafe, replacing the
currently served table in place exposes partial results, and a learning completion may arrive while
a rebuild is catching up.

## Decision

- Migration V14 versions every daily row with a projection generation. A singleton state row points
  readers and incremental writers to the active generation.
- The internal `ProgressProjectionMaintenance.rebuildDaily(ruleVersion)` command creates a
  `BUILDING` generation and populates it only from the immutable activity ledger. It is not exposed
  as an unauthenticated HTTP endpoint.
- Before switching, the command takes an exclusive lock on the state row, clears and repopulates the
  candidate from the latest committed ledger, and compares total projected seconds with total
  ledger seconds. A mismatch aborts activation.
- Incremental writers take a shared lock on the same state row before resolving the active
  generation. A writer that inserted a ledger entry just before the switch either completes on the
  old generation before catch-up or resumes after the switch and writes the new generation.
- A valid candidate becomes `ACTIVE` in the same transaction as the pointer switch. The previous
  generation becomes `RETIRED` and remains available for audit/rollback. A failed candidate is
  marked `FAILED`.
- Rebuild metadata records source row count, total seconds, watermark, projected day count, rule
  version and activation time.

## Consequences

- Readers never observe a partially built generation.
- Rebuild performs a second full aggregation while holding the short switch lock. This favors a
  simple correctness proof for MVP; chunked watermark catch-up is a future optimization if measured
  ledger size makes the lock window unacceptable.
- Only one `BUILDING` generation is allowed, preventing concurrent rebuild commands.
- Retired generations require a later retention policy; they are not deleted automatically in B09.
- PostgreSQL lock and native aggregation behavior is covered by a Testcontainers integration test,
  which requires Docker to execute locally.
