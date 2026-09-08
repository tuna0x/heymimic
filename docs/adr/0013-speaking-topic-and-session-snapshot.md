# ADR 0013: Speaking topic revisions and session prompt snapshots

- Status: Accepted
- Date: 2026-09-08

## Context

Speaking practice needs a curated prompt catalog that can evolve without rewriting historical
sessions. Refresh must resume the active exercise from server state, and topic edits or archival
must not change the instructions shown for an already-started session.

## Decision

- Migration V8 creates `speaking_topics` and `speaking_sessions`, and seeds four initial topics from
  the product fixture without any mock evaluation result.
- A topic has a positive revision and structured JSON content containing context, starter sentence,
  outline, key vocabulary and model answer. Archived topics are excluded from catalog reads and
  cannot start new sessions.
- Session creation requires a UUID `Idempotency-Key`, rejects a second `IN_PROGRESS` session for the
  same user, snapshots the complete topic view and learner timezone, and stores the topic ID and
  revision separately for traceability.
- `GET /api/v1/speaking/topics` supports allowlisted category and level filters. Session detail and
  active-session reads are owner-scoped and render the stored prompt snapshot rather than joining
  the current topic content.
- Abandon is an idempotent, pessimistically locked terminal transition guarded by
  `expectedVersion`. It releases the per-user active-session constraint but retains the snapshot.
- Complete is intentionally not exposed in this slice. B07 must first provide an owned selected
  attempt with a successful evaluation so completion can enforce its domain guard.
- Speaking data participates in the ordered account-deletion cleaner workflow.

## Consequences

- Editing or archiving a topic affects only future sessions.
- The current UI can reliably resume after reload without local storage being authoritative.
- Topic JSONB mapping, the partial unique index and seeded UTF-8 content require PostgreSQL
  integration verification; the migration test is updated but needs a running Docker daemon.
