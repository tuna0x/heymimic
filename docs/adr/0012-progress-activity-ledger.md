# ADR 0012: Immutable progress activity ledger

- Status: Accepted
- Date: 2026-09-08

## Context

Vocabulary review completion is delivered asynchronously and at least once. A worker can crash
after applying an event, a lease can expire while a consumer is running, and the same logical
completion must never add learning duration twice. Daily projections are implemented separately in
B09, but they need a durable rebuild source from the moment completion events are enabled.

## Decision

- Migration V7 introduces `progress_activity_ledger` as an immutable, user-owned source of accepted
  learning duration. It stores the event ID, logical source, timezone snapshot, derived activity
  date, accepted seconds, rule version and occurrence timestamp.
- `VocabularyReviewCompleted` schema v1 is consumed by `progress-activity-ledger-v1`. The consumer
  validates the envelope against the payload, rejects unsupported schemas and invalid ranges, and
  derives `activity_date` from `completedAt` in the session's IANA timezone snapshot.
- The ledger has unique constraints on `event_id` and `(source_type, source_id)`. PostgreSQL
  `INSERT ... ON CONFLICT DO NOTHING` makes delivery replay and accidental duplicate logical events
  no-ops.
- Consumer persistence and the fenced delivery acknowledgement execute in the same Spring
  transaction. If acknowledgement loses its lease fence, the ledger insert rolls back and the
  current lease owner can process the delivery.
- B05 did not write a daily projection. B09 migration V12 and ADR 0021 add incremental daily
  projection from newly accepted ledger entries; online rebuild/swap remains a later B09 slice.
- Account deletion removes the user's ledger through the ordered `AccountDataCleaner` workflow
  before the identity row is deleted.

## Consequences

- Completion delivery may execute more than once, but accepted duration is persisted at most once.
- Historical activity dates do not change when the learner later changes profile timezone.
- Adding speaking duration requires a `SPEAKING_SESSION` consumer using the same ledger contract.
- V7, the native upsert and the cross-row transaction boundary require PostgreSQL integration tests;
  the tests are present but require a running Docker daemon locally.
