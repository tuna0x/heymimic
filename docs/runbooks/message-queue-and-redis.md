# RabbitMQ and Redis operations

## Local startup

Run from the repository root with Docker Desktop running:

```powershell
docker compose up -d postgres rabbitmq redis
cd backend
$env:SPRING_PROFILES_ACTIVE='dev,mq'
.\mvnw.cmd spring-boot:run
```

The mq profile enables RabbitMQ dispatch, catalog caching, and the daily-plan refresh worker. Compose pins RabbitMQ 4.2.2-management and Redis 7.4.7-alpine; both images were pulled and started locally. Compose is a single-node development environment, not an HA deployment. Rabbit management is at http://localhost:15672 (local development credentials in compose.yml). AMQP, management and Redis ports bind to loopback.

With the dev profile alone, `MESSAGING_TRANSPORT=rabbitmq` and `CACHE_ENABLED=true` also enable the adapters. Explicitly using the mq profile overrides those individual default values; remove mq from active profiles when rolling back by environment flags.

## Process roles and capacity

| Setting | Effect |
|---|---|
| `JOBS_ENABLED=false`, `EVENTS_ENABLED=false` | API role retains handler/consumer registration without polling/listening |
| `DISPATCH_RELAY_ENABLED=false` | Disables both relay and expired-lease recovery on that process |
| `heymimic.messaging.workloads.email/speaking/context/planning/maintenance=false` | Excludes that job queue from this worker process |
| `heymimic.messaging.concurrency.email/speaking/context` | Default 2 per workload |
| `heymimic.messaging.concurrency.planning` | Default 1 |
| `heymimic.messaging.concurrency.maintenance` | Default 1 |
| `heymimic.messaging.concurrency.events` | Default 2 |
| `WORKER_ID` | Optional process-unique identifier; omitted generates a UUID at boot |
| `CACHE_NAMESPACE`, `CATALOG_CACHE_REVISION` | Isolate environments and invalidate catalog entries |
| `RABBITMQ_HOST/PORT/USERNAME/PASSWORD/VHOST` | Broker connection settings |
| `REDIS_HOST/PORT/PASSWORD` | Cache connection settings |
| `DAILY_PLAN_REFRESH_ENABLED` | Enables the per-user rule-only background planner |
| `DAILY_PLAN_REFRESH_INTERVAL/BATCH_SIZE` | Scheduler poll interval and candidate batch size (defaults 1s/100) |

Keep at least one relay/recovery process running when using MQ. Multiple relay replicas are safe. API-only replicas may relay, or delegate it to a dedicated process. Spring Boot relaxed environment binding also supports the full `HEYMIMIC_MESSAGING_*` names for workload/concurrency settings.

Prefetch=1; source queue capacity=100,000 messages; overflow rejects publishes so dispatch stays in DB. Job lease=120s, heartbeat every40s, listener drain timeout=150s. Default broker consumer timeout remains above the current bounded provider calls. Validate the timeout against measured end-to-end job duration before adding longer jobs. Keep sufficient DB pool capacity for claims, heartbeat and finalization; each default worker process can execute eight jobs and two event deliveries concurrently.

## Recovery and replay

- Publisher crash: PUBLISHING lease expires after30s; a new publisher takes over with a new token.
- Publisher return/NACK/timeout: dispatch becomes due again after5s. Business attempts do not change.
- Confirmed notification lost: unclaimed PUBLISHED dispatch becomes due after60s and is republished.
- Worker crash: recovery scans every10s and requeues expired DB leases. Old workers cannot commit through the domain fence.
- Future retry: the DB due time prevents early execution; the old dispatch generation cannot claim it.
- Domain terminal before worker ACK: a replay prepares no remaining work, or exhausted-budget recovery checks completed domain state; no completed AI stage is run again.
- `BUILD_DAILY_PLAN` is rule-only: the scheduler coalesces one PENDING/RUNNING request per user, applies a 3-second debounce, and reuses the current plan settings. It does not call an AI provider or consume provider quota.
- Malformed message or unexpected listener/DB failure: reject to the workload DLQ. PostgreSQL remains the recovery authority. Diagnose DLQ contents before any replay; do not shovel every DLQ message repeatedly back to the main queue.
- FAILED_FINAL event repair: use the existing audited delivery replay workflow (ADR0025). It atomically increments dispatch generation. Do not edit attempts/status directly in production.
- Account deletion: existing cleaner deletes job/delivery rows; dispatch FKs cascade. Messages already on the broker contain references only and are acknowledged as missing targets later.

Dead-letter forwarding is at-least-once; route repair may wait for the broker's multi-minute internal retry interval. If a DLQ route is missing/unavailable, the quorum source retains rejected messages until it can forward them. This consumes source capacity and can eventually reject fresh publishes, so alert on DLQ growth and missing bindings.

## Cache behavior

The catalog cache stores JSON with a bounded TTL and versioned keys. DB availability checks for a selected topic still happen at session creation. Redis errors open a short local bypass and do not roll back business work. No personalized or security-sensitive state depends on Redis in this slice.

Set a distinct namespace for every environment using a shared Redis cluster. Change `CATALOG_CACHE_REVISION` on catalog deploy/restore. Redis can be discarded and refilled from DB; no KEYS scan or persistent cache backup is needed. Compose caps Redis at128MB with allkeys-lru eviction and disables persistence.

## Observability and rollout

Retain the existing job/event duration, attempt outcome, heartbeat, due-depth and oldest-lag metrics. New counters are `heymimic.dispatch.publish` (confirmed/retry), `heymimic.dispatch.recovered`, and `heymimic.cache.topics` (hit/miss/invalid/fallback). Tags do not contain user/resource identifiers. Broker management provides ready/unacked/DLQ depths and consumer counts. Redis health checks are enabled with the mq profile; a failed Redis health check can be excluded from a deployment readiness group because DB fallback remains available.

Alert on repeated publisher retries, zero consumers for an enabled queue, oldest pending job age>5m, event lag>60s, exhausted jobs, finalization recovery loops and DLQ growth. These are initial operator thresholds, not benchmark-derived SLOs.

Apply V21 before enabling MQ, start topology/relay, then enable workers. For rollback, drain MQ listeners, remove the mq profile, set `MESSAGING_TRANSPORT=postgres` and optionally `CACHE_ENABLED=false`, then restart using this release's fenced PostgreSQL pollers. Keep V21 and business rows. Stop relay while polling to avoid unused broker backlog. Never drop queue/DB data as part of rollback.

Production acceptance still requires a measured workload-specific capacity run, three-node quorum failover/restore drill and provider-budget validation. Use the existing [speaking load harness](speaking-load-test.md) with controlled fake providers first. The local functional tests do not establish a production throughput claim; planner tests cover deterministic rules, request coalescing and persistence, while end-to-end frontend personalization remains open.

## Verification

```powershell
cd backend
.\mvnw.cmd verify
```

If an IDE writes incompatible/incomplete classes into target while Maven runs, use a separate build output:

```powershell
.\mvnw.cmd '-Dheymimic.build.directory=D:/WEB/heymimic/backend/target/agent-verify' verify
```

The test suite covers DB rollback/idempotent enqueue, due-time/generation gating, duplicate claim races, stale/expired domain writes, finalization budget, Rabbit confirm+return, publisher recovery, replay fanout/deletion cascade, manual ACK order, Spring API role registration, cache JSON/TTL/corruption/disconnect, level mapping and planner request coalescing. Redis/RabbitMQ/PostgreSQL integration tests run in disposable Testcontainers and use no paid providers.


## Recorded local acceptance ? 2026-09-09

`mvnw.cmd '-Dheymimic.build.directory=D:/WEB/heymimic/backend/target/agent-verify' spotless:apply verify` completed with BUILD SUCCESS: 122 unit/architecture/OpenAPI tests and 35 integration tests, zero failures/errors/skips. The RabbitMQ suite includes13 tests; the cache suite uses a real Redis container. The complete run took 7m15s, including the broker's real multi-minute DLQ retry cycle. Runtime of the test suite is not a throughput benchmark.

Two account registrations were consumed by the real Rabbit listener with distinct owner-scoped verification tokens using the in-memory email provider. Missing-DLQ-binding recovery retained the rejected message in the source quorum queue and delivered it after rebinding. No paid provider or external email was used.

`git diff --check` and `docker compose config --quiet` passed. Local Compose RabbitMQ and Redis were healthy. Existing HTTP/OpenAPI contracts passed unchanged, including the restored bearer+CSRF enforcement. Earlier IDE class-output interference was avoided with the separate build directory; immediate-claim fixtures use PostgreSQL time to avoid host/container clock skew.

This is local functional acceptance for the infrastructure and first personalization slices. The H01 capacity baseline, H08 production HA/restore drills, P02 target/evidence remediation, P04 frontend integration, P05 Study start/LAZY lifecycle and P06 feedback loop remain open as described in the plan. The background planner scheduler and RabbitMQ handler are included in this slice; the latest unit suite passed 129 tests.

## Personal context and daily planning

The learning context revision tables in V22 are the PostgreSQL freshness authority. Source mutations record one revision in the same transaction as their outbox event; required event deliveries must reach SUCCEEDED before a revision is ready. A FAILED_FINAL dependency blocks the context until the audited delivery replay flow repairs it. The readiness checkpoint advances only through a contiguous completed prefix.

Rule-only daily planning is available through POST /api/v1/study/daily-plans and GET /api/v1/study/daily-plans/today. POST requires an owner-scoped Idempotency-Key, accepts 5, 10, or 15 minutes, returns a versioned immutable snapshot, and rejects sourceBriefId with SOURCE_BRIEF_UNSUPPORTED until the brief capability is wired. It returns 409 LEARNING_CONTEXT_UPDATING, LEARNING_CONTEXT_BLOCKED, or LEARNING_CONTEXT_CHANGED when the input is not safe to publish. GET never creates work: it returns IDLE, UPDATING, or BLOCKED with the current plan envelope.

Daily plans currently choose overdue vocabulary and an available speaking topic with deterministic rules. They do not create child sessions or call AI. Study start/LAZY lifecycle and target/evidence remediation remain follow-up slices. The background planner scheduler and RabbitMQ handler are included in this slice.
