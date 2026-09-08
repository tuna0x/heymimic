# ADR 0022: Speaking feedback mistake projection

- Status: Accepted
- Date: 2026-09-08

## Context

Validated speaking feedback contains correction items that can reveal recurring learner mistakes.
Progress owns the user-facing pattern lifecycle, but it must not read speaking persistence directly
or merge unrelated free-form AI text.

## Decision

- Speaking publishes `SpeakingEvaluationCompleted` schema v1 in the same transaction that completes
  the evaluation, saves feedback items, completes the attempt and consumes quota.
- Feedback item IDs are deterministic from evaluation ID and position. The event carries those IDs,
  the validated category, optional taxonomy key, note and corrected text; it carries no audio,
  signed URL or provider secret.
- Progress consumer `progress-mistake-projection-v1` validates the event envelope and item schema.
  An occurrence is unique by feedback item ID, making delivery replay idempotent.
- Known keys group only within user, category and taxonomy version. Missing keys become
  `unknown:<feedbackItemId>`, so similar AI prose never causes an unsupported merge.
- Patterns use `ACTIVE`, `RESOLVED` and `IGNORED`. Changing status is owner-scoped and guarded
  by `expectedVersion`; occurrences and counts are retained.
- List and occurrence history are paginated. Recommendation is deterministic: overdue vocabulary,
  then the most recently seen active mistake, then the first compatible speaking topic.

## Consequences

- Progress depends only on public query contracts from vocabulary/speaking and serialized outbox
  events, never their repositories or domain internals.
- Repeated occurrences update last-seen time but do not automatically reopen a resolved or ignored
  pattern.
- Migration V13 and native conflict handling require PostgreSQL integration verification. These
  tests remain gated locally by the unavailable Docker daemon.
- Projection rebuild/backfill remains the final B09 backend slice.
