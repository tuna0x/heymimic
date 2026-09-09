# ADR 0025: Audited replay of final event deliveries

- Status: Accepted
- Date: 2026-09-09
- Scope: B11 platform operations

## Context

An event consumer can reach `FAILED_FINAL` because of a deploy defect or an unavailable
dependency. Silently editing the delivery row loses operator intent and makes it impossible to
distinguish automatic retry from manual recovery. Re-emitting the source domain event would also
create a new event identity and weaken the consumer deduplication contract.

## Decision

Expose `EventDeliveryReplay` as an internal application command. It is deliberately not an HTTP
controller.

- A request requires the delivery UUID, a stable operator identity, a reason of at least ten
  characters and an explicit dry-run flag.
- The command locks the target delivery. Only `FAILED_FINAL` is eligible; missing and non-final
  targets are rejected without mutation.
- Dry-run writes an audit row with `DRY_RUN_ALLOWED` and leaves the delivery unchanged.
- A real replay resets attempts and the previous error, clears lease data, sets
  `next_attempt_at` to the command time and returns the same delivery to `PENDING`.
- Audit and mutation commit in one database transaction. The audit table intentionally has no
  foreign key to the delivery/event tables so account deletion and retention cannot erase the
  operational record.
- The original event ID and payload are retained. Consumers remain at-least-once and must enforce
  their existing domain deduplication keys.

The outcomes `NOT_FOUND`, `REJECTED_STATUS`, `DRY_RUN_ALLOWED` and `REQUEUED` are persisted
with the previous status, attempt count and error code. Reasons must not contain credentials,
signed URLs, transcripts or event payloads.

## Operational procedure

1. Diagnose and deploy the consumer fix.
2. Invoke the internal command with `dryRun=true`; retain the returned audit ID.
3. Confirm the target consumer, previous error and eligibility in
   `platform_delivery_replay_audit`.
4. Invoke the same target with `dryRun=false` and a new reason describing the approval/fix.
5. Monitor delivery lag and the worker outcome metrics until the original delivery succeeds.

Job replay is intentionally excluded. Jobs can authorize paid provider work and may require
resource-specific recovery rules. Adding job replay requires a separate ADR and per-job-type
eligibility policy.

## Consequences

Operators receive a deterministic and reviewable recovery path without creating duplicate event
identities. Resetting attempts grants a fresh retry budget, so replay remains a privileged
operation. The command interface must only be wired into trusted maintenance tooling.
