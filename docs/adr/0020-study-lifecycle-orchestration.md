# ADR 0020: Study lifecycle orchestration

- Status: Accepted
- Date: 2026-09-08

## Context

The Study parent must reflect child progress without owning vocabulary or speaking state. Clients
can also call child endpoints directly, so every parent transition must read authoritative child
state and remain safe under reload, duplicate commands and concurrent requests.

## Decision

- Every mutating parent operation locks the owner-scoped Study session. Conditional repository
  updates also require `IN_PROGRESS` and the supplied `expectedVersion`.
- Step transition accepts only `currentStep + 1`, requires that target to exist, and requires the
  current child status to be `completed`. Backward moves, skips and advancing past the plan return
  `INVALID_STUDY_STEP_TRANSITION`; an active/abandoned child returns
  `STUDY_CHILD_NOT_COMPLETED`.
- Parent completion requires every planned child to be `completed`. The command is idempotent and
  a completed parent can return its stable terminal representation without producing another side
  effect.
- Study completion emits no learning-duration event. Vocabulary and speaking completion events are
  the only duration sources, preventing double counting for combined sessions.
- Parent abandon is idempotent. It keeps completed or already abandoned child history and calls the
  child public API only for `inProgress` children, using deterministic internal idempotency keys.
  Child abandons and the parent transition share one transaction.
- A completed parent cannot be abandoned, and an abandoned parent cannot be completed or advanced.
  Stale versions return `STUDY_SESSION_VERSION_CONFLICT`.

## Consequences

- Reloaded clients can derive the next valid action from parent version/current step and child
  statuses.
- Direct child completion is reconciled when Study next reads or transitions; no duplicate child
  state is maintained.
- A failure while abandoning any child rolls back all child and parent mutations, so retry resumes
  from one consistent database state.
- The shared-database transaction is intentional for the modular monolith. Service extraction
  would require a durable orchestration state machine instead.
