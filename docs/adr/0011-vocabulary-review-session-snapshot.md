# ADR 0011: Vocabulary review session snapshot and word locking

- Status: Accepted
- Date: 2026-09-07

## Context

A vocabulary review must survive browser refresh without changing order, must not allow two active
sessions to mutate the same word, and must support later transactional rating and undo operations.
Client-local state is not sufficient for these guarantees.

## Decision

- `POST /api/v1/vocabulary/review-sessions` requires a UUID `Idempotency-Key` and accepts an
  optional ordered list of at most 50 unique word IDs.
- An explicit list is owner-checked and preserves client order. Without a list, `simple-v1`
  selects at most 20 unlocked words ordered by `next_review_at, id`.
- Creation snapshots the learner timezone, persists ordered review items and sets
  `vocabulary_words.review_lock_session_id` in the same transaction.
- A PostgreSQL partial unique index permits only one `IN_PROGRESS` review session per user.
  Pessimistic word locks plus the conditional bulk assignment prevent overlapping sessions.
- `GET /api/v1/vocabulary/review-sessions/{id}` is owner-scoped. `GET .../active` returns the
  active server snapshot or a nullable body, so refresh does not depend on local storage.
- Review items and events are separate tables. An item points to its active event; event
  before/after JSON snapshots make the last rating reversible without recomputing history.
- `POST .../{id}/ratings` is idempotent and locks the session before validating its optimistic
  version and current word. `simple-v1` applies the documented mastery/interval transition, stores
  versioned before/after word state, advances the cursor and marks the next item presented in one
  transaction. Server-estimated item duration is capped at 120 seconds.
- `DELETE .../{id}/ratings/{eventId}?expectedVersion=...` also requires `Idempotency-Key`. Only the
  immediately previous active event can be undone. It restores the versioned `before_state`, marks
  the audit event undone, clears the item's active event, resets its presentation timestamp and
  rewinds the cursor atomically; the audit row is never deleted.
- `POST .../{id}/complete` requires every item to have an active rating. It stores the terminal
  state, releases every word lock and publishes one transactional `VocabularyReviewCompleted`
  outbox event containing the accepted active-rating duration and the session timezone/rule
  snapshots.
- `POST .../{id}/abandon` retains ratings already applied, publishes no completion event and
  releases every word lock. Complete and abandon both require `Idempotency-Key` and the expected
  session version; an already-matching terminal operation returns its stable result without a
  second state transition or event.
- A scheduled cleanup selects `IN_PROGRESS` sessions whose `last_activity_at` exceeds the
  configurable inactivity timeout (24 hours by default). It uses bounded PostgreSQL
  `FOR UPDATE SKIP LOCKED` batches, then abandons each selected session and releases its locks in
  the same transaction.

## Consequences

- Word content updates are rejected while the word belongs to an active review session.
- A lock-count mismatch aborts the terminal transaction so a session cannot commit while leaving
  one of its words locked.
- Migration V6 and native/locking queries require PostgreSQL integration verification; unit and
  architecture tests do not replace that check.
