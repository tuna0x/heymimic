# ADR 0031 ? RabbitMQ dispatch and Redis catalog cache

- Date: 2026-09-09
- Status: implemented infrastructure slice; production capacity/failover gates remain open.
- Related: ADR 0002, 0008, 0016, 0025, 0030; migration V21.

## Decision

PostgreSQL owns jobs, event deliveries, retries, execution leases, checkpoints and business state. RabbitMQ carries a versioned dispatch reference (`schemaVersion`, `dispatchId`, `generation`), never the learner payload. Each event consumer keeps its own DB delivery and dispatch. Consumers need not process every event for a user in FIFO order; existing projections retain their source idempotency rules.

Five durable quorum queues isolate email, speaking evaluation, vocabulary context analysis, maintenance and event projection workloads. Prefetch is one, with independently configurable concurrency. Workers claim exactly the referenced target after checking route, generation, due time and lifecycle. Duplicate, stale, early or already-running references do not spend an execution attempt.

Publisher confirms and mandatory returns are both checked. A publisher ACK with a returned message is a failed publish. The relay commits its claim before network I/O; completion checks a unique publish token and generation. Publish timeout/failure leaves durable work for retry. A confirmed but unclaimed dispatch is republished after 60 seconds, covering broker restore/lost notifications. This can create duplicates and relies on the DB claim gate. See [Spring AMQP confirms and returns](https://docs.spring.io/spring-amqp/reference/amqp/template.html).

DB retry scheduling replaces the dispatch generation. Expired RUNNING jobs/deliveries are recovered in bounded batches with SKIP LOCKED and get a new dispatch. Business retry uses the existing 10s/30s/2m/10m schedule. Transport failures never increment business attempts. Once the execution budget is exhausted, reclaim may increment the lease/attempt counter for finalization, but never invokes another provider attempt.

Domain writes now run inside a job fence transaction that locks and validates job ID, owner, resource, type, worker, generation and expiry, then rechecks expiry after the callback. Network calls remain outside this transaction. Final-failure callbacks and the DB terminal transition commit together; a failed callback leaves the job recoverable. Account deletion cleaners and their checkpoints are fenced together. The deletion job can retain a null owner after the existing privacy cleanup, while still validating its resource and execution identity.

Event projection writes and delivery success retain their existing single transaction. Broker ACK follows the executor. Infrastructure failure is dead-lettered without an immediate requeue loop; the DB relay/recovery path remains authoritative. Each source quorum queue enables at-least-once dead lettering, reject-publish overflow, an explicit delivery limit and a dedicated durable DLQ. [RabbitMQ dead-letter semantics](https://www.rabbitmq.com/blog/2022/03/29/at-least-once-dead-lettering).

## Deliberate refinements to the implementation plan

V21 uses narrow PostgreSQL triggers on job/delivery insertion and lifecycle/due-time updates. This closes the invariant across every existing enqueue, direct JDBC store, audited replay, recovery and older application replica in the same transaction. A Java-only hook would require all those paths to migrate together. The triggers contain transport routing/lifecycle metadata only; they never call RabbitMQ or run learning policy. Routing is covered by an integration test for every current job type.

There is one compact dispatch row per target, with a monotonic generation and fenced publish token, rather than retaining an unbounded row history per retry. Foreign keys cascade deletion from jobs/deliveries. Existing replay audit remains the operator history. Terminal/running dispatches are marked obsolete. The schema reserves QUARANTINED for future operator tooling; current malformed-message quarantine is the broker DLQ.

Redis caches only the public topic catalog in this slice. JSON is explicit, keys include environment namespace/schema/catalog revision and normalized filters, TTL is five minutes plus 0?10% jitter, and 32 local lock stripes serialize cache refill. A Redis failure opens a five-second local bypass; reads fall back to PostgreSQL. Command/connect timeouts are 200ms. Topic-by-ID lookup always reads current DB availability before session creation. Bump the catalog revision to invalidate listings after a catalog deployment; old entries expire. Redis contains no auth/session/quota, learner transcript or personal plan data.

`PracticeLevelResolver` maps beginner/elementary/unspecified to A2-B1 and intermediate to B1-B2. This fixes the prior mismatch between onboarding level strings and topic bands; it is a product fallback, not an assessment of proficiency.

## Compatibility and limits

Default transport remains postgres. The `mq` profile enables RabbitMQ and Redis explicitly. Both transports use the same DB execution fence, so rollback does not require reversing V21. Do not roll back to binaries predating the domain fence while scaled workers are active.

External provider/email effects remain at-least-once: a process can die after the remote side effect but before its checkpoint. Saved STT checkpoints avoid repeated completed stages; provider idempotency is still required where supported. The implementation does not promise exactly-once remote billing or email.

The original baseline integration suite exposed bearer-authenticated DELETE bypassing CSRF despite its existing test/README contract. The security filter now enforces its default unsafe-method CSRF matcher after resource-server defaults are applied; the existing account/profile integration test verifies this requirement.

The MQ/Redis transport keeps existing API contracts unchanged. P01 learning-context revisions and the P03 rule-only daily-plan API are additive product slices; evidence/target assessment, UI personalization and remaining planner lifecycle work stay separate. Infrastructure being green does not enable feature flags by itself.

See [the runbook](../runbooks/message-queue-and-redis.md) for startup, recovery, evidence and remaining release gates.

## Product-slice amendment (2026-09-10)

The infrastructure decision remains unchanged, but this branch now also includes the first learning-loop slice. V22 adds per-user learning-context revisions and delivery readiness; V23 adds persistent rule-only daily-plan state, requests, immutable snapshots, steps and recommendation reasons. The daily-plan endpoints are owner-scoped and use PostgreSQL for source-of-truth freshness; Redis continues to cache only the public speaking catalog. Target/evidence remediation, Study start/LAZY lifecycle and frontend rollout remain separate follow-up work. The rule-only BUILD_DAILY_PLAN scheduler, request coalescing and RabbitMQ handler are included in this branch.
