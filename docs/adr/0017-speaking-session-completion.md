# ADR 0017: Speaking session completion and progress duration

- Status: Accepted
- Date: 2026-09-08

## Context

A speaking session may contain several attempts and evaluations. Completion must choose the
attempt shown as primary feedback without losing valid practice time from other attempts. It also
has to remain correct under retries, concurrent evaluation jobs and asynchronous progress
projection.

## Decision

- Session detail loads owner-scoped attempts in attempt order and attaches the corresponding
  evaluation when present. History is paginated and omits nested attempts to keep list responses
  bounded.
- Complete requires an idempotency key, `selectedAttemptId` and `expectedVersion`. The application
  locks the owned session and accepts only an `IN_PROGRESS` session at that version.
- No attempt may be `QUEUED` or `RUNNING`. The selected attempt must belong to the session, and
  both its processing state and evaluation state must be `COMPLETED`.
- `selectedAttemptId` controls the primary feedback only. Accepted practice duration is the sum
  of verified `durationMs` for every attempt whose processing and evaluation both completed.
  Milliseconds are summed first and then rounded down once to seconds. The rule is versioned as
  `speaking-duration-v1`.
- The session transition and `SpeakingSessionCompleted` outbox insert share one transaction.
  Repeating an already completed transition with the same selected attempt returns its stable
  summary and does not publish another event; a different selection conflicts.
- Event v1 contains the session/user IDs, completion instant, timezone snapshot, accepted seconds,
  successful evaluated attempt IDs and rule version.
- The progress consumer validates schema/envelope identity, timezone, duration bounds, non-empty
  unique attempt IDs and rule version before appending an immutable `SPEAKING_SESSION` ledger
  entry. The activity date is derived from completion time in the session timezone snapshot.

## Consequences

- Retakes contribute to honest practice duration while one selected result remains the session's
  canonical feedback.
- A session cannot be completed while provider work could still change its accepted duration.
- Progress delivery is retry-safe through the existing event and logical-source uniqueness
  constraints.
- History remains cheap; callers fetch one session when they need nested attempt/evaluation data.
- Changing duration policy requires a new rule version and an explicit projection migration or
  rebuild policy.
