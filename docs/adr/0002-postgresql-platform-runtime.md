# ADR 0002: PostgreSQL platform runtime

- Status: Accepted
- Date: 2026-09-07
- Scope: B01 job queue and transactional outbox foundation

## Context

HeyMimic needs durable asynchronous work for email, AI, transcription, projections and
account deletion. The modular monolith must recover after process crashes and support more than
one application instance without introducing Redis, Kafka or a separate worker service in the
first release.

## Decision

Use PostgreSQL as the durable queue and event-delivery store.

- Workers claim one due row with `FOR UPDATE SKIP LOCKED` and commit the claim before invoking a
  handler or consumer.
- Every claim increments `lease_generation`. Heartbeat, checkpoint and terminal writes require
  the same worker ID, generation and an unexpired lease. This fencing condition prevents a stale
  worker from committing after another worker has reclaimed the row.
- Job handlers are selected through the `JobHandler` public SPI. Long-running jobs receive an
  automatic heartbeat from a dedicated daemon scheduler.
- Events are appended to `platform_outbox_events` in the producer transaction. One independent
  `platform_event_deliveries` row is created for every registered `EventConsumer` interested in
  the event type.
- Delivery is at-least-once. Consumers must therefore be idempotent and enforce a domain-level
  deduplication key when they write projections.
- Retry uses bounded backoff (10 seconds, 30 seconds, 2 minutes, then 10 minutes) and a configurable
  maximum attempt count. Missing handlers/consumers and inactive accounts fail finally.
- Test profile disables scheduled polling; persistence and recovery are tested directly against
  PostgreSQL 17.6 through Testcontainers.

## Transaction boundaries

Claim, heartbeat/checkpoint and each terminal transition use a short transaction. External API,
AI, storage and email calls must happen outside database transactions. Publishing an outbox event
and creating its delivery rows occurs in the caller's business transaction.

## Consequences

The first deployment has no additional broker and can scale to multiple application instances.
Polling adds bounded database load and delivery is not exactly-once. A consumer must be deployed
and registered before its producer is enabled; backfill/replay tooling is required before changing
that operational contract.

## Remaining platform hardening

Typed idempotency and quota reservation services are implemented and documented in ADR 0003.
Audited replay for final deliveries is implemented by the internal command documented in ADR 0025.
Retention cleanup and worker/queue metrics are also implemented. Restore drills, production release
evidence and broader load tests remain release-hardening increments.
