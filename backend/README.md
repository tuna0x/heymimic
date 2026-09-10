# HeyMimic backend

Spring Boot modular monolith for HeyMimic. Java 21 and PostgreSQL are required.

## Local development

```powershell
docker compose up -d postgres
cd backend
.\mvnw.cmd spring-boot:run
```

The API uses `/api/v1`; health is available at `/actuator/health`.

RabbitMQ + Redis are available through `SPRING_PROFILES_ACTIVE=dev,mq` after
`docker compose up -d postgres rabbitmq redis`. See [startup, worker roles, recovery and rollback](../docs/runbooks/message-queue-and-redis.md) and [ADR0031](../docs/adr/0031-rabbitmq-dispatch-and-redis-cache.md).

## Operational metrics

Micrometer records bounded outcome counters and execution timers for the platform workers:

- `heymimic.platform.jobs.processed` and `heymimic.platform.jobs.duration`, tagged by job
  `type` and `outcome`.
- `heymimic.platform.jobs.heartbeats`, tagged by job `type` and heartbeat `outcome`.
- `heymimic.platform.events.processed` and `heymimic.platform.events.duration`, tagged by
  `consumer` and `outcome`.
- `heymimic.platform.jobs.due` and `heymimic.platform.jobs.oldest.due.age.seconds` for
  immediately claimable jobs, including expired leases.
- `heymimic.platform.events.deliveries.due` and
  `heymimic.platform.events.oldest.delivery.lag.seconds`; delivery lag starts at the original
  event occurrence time.
- `heymimic.platform.queue.observations` and
  `heymimic.platform.queue.observations.last.success.epoch.seconds` expose observer health.
- `heymimic.maintenance.runs`, `heymimic.maintenance.items` and
  `heymimic.maintenance.last.success.epoch.seconds` for vocabulary cleanup and speaking audio
  retention.

Only health and info are exposed by default. Operations may set
`MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,metrics` only when `/actuator/metrics` is
kept behind a private operations ingress. Health and info are public; every other actuator route
still requires authentication in the application security chain.

Initial alerts should cover repeated `failed_final` or `lease_rejected` worker outcomes,
maintenance failures, speaking audio item failures, oldest due job age above five minutes,
delivery lag above 60 seconds, and stale queue/maintenance last-success gauges. Queue observations
run every 30 seconds by default and can be tuned with `QUEUE_METRICS_INTERVAL`.

## OpenAPI contract

Controllers and their request/response DTOs are the source of truth. Springdoc 3.0.3 exposes
`/v3/api-docs` in development and test; production disables the endpoint. Export and regenerate
the frontend definitions after an intentional contract change:

```powershell
cd backend
.\scripts\export-openapi.ps1
cd ..\frontend
yarn generate:api
```

`OpenApiContractTest` imports every HTTP controller with mocked application ports, so export and
drift checks do not require PostgreSQL, Docker or provider credentials. A normal `mvnw.cmd test`
fails when the committed `openapi/openapi.json` differs from the controller-derived contract.

The B02 identity API exposes `GET /api/v1/auth/csrf` plus register, login, refresh, logout,
verify-email, resend-verification, forgot-password and reset-password under `/api/v1/auth`.
Browser mutations must copy the CSRF response token into the `X-CSRF-TOKEN` header. Registration
normalizes email, hashes passwords with Argon2id, creates the identity user plus learner profile,
and enqueues verification delivery in one transaction.

Login returns a ten-minute RS256 access token and sets a 30-day
`__Secure-mimic_refresh` cookie. Refresh tokens rotate on every use; reuse or logout revokes the
whole session family. Only token hashes are persisted. Development/test generate an ephemeral RSA
key pair; production requires Base64 PKCS#8/X.509 keys through the variables documented in
`.env.example`.

Verification jobs do not contain the raw token. The worker creates a random 256-bit token, persists
only its SHA-256 hash with a 24-hour expiry, then calls the email adapter after the token transaction
commits. Development and test use an in-memory adapter; production intentionally requires a real
`IdentityEmailSender` bean. See `docs/adr/0005-email-verification-delivery.md`.

Password reset tokens live for 30 minutes. A successful reset changes the Argon2id hash, increments
`authVersion` and revokes all session families. Login failures and recovery requests use atomic
PostgreSQL fixed-window limits; rejected requests return `429` with `Retry-After`. See
`docs/adr/0006-password-recovery-and-auth-rate-limits.md`.

B03 exposes authenticated `GET /api/v1/me`, `PATCH /api/v1/me/profile` and
`PUT /api/v1/me/onboarding`. Ownership always comes from the JWT subject. Profile writes use an
`expectedVersion` compare-and-set; stale writes return `409 PROFILE_VERSION_CONFLICT`.
Identical onboarding retries are idempotent, while attempts to replace completed onboarding return
`409 ONBOARDING_ALREADY_COMPLETED`.

`POST /api/v1/auth/change-password` is authenticated even though the other listed auth workflows
are public. It verifies the current password, changes the Argon2id hash, increments `authVersion`,
revokes every session family and expires the refresh cookie. See
`docs/adr/0007-learner-profile-concurrency-and-password-change.md`.

`DELETE /api/v1/me` requires the current password, confirmation `DELETE`, Bearer authentication
and CSRF. It immediately marks the account `DELETING`, increments `authVersion`, revokes all
sessions and returns `202`. A `DELETE_ACCOUNT` maintenance job then drains user jobs and runs
ordered, idempotent platform/learner cleaners with durable per-step checkpoints before deleting
identity tokens and the user row. See `docs/adr/0008-checkpointed-account-deletion.md`.

B04 has started with the vocabulary word core. `GET /api/v1/vocabulary/words` provides owner-scoped
pagination with `status` and `dueBefore` filters. `PATCH /api/v1/vocabulary/words/{wordId}`
updates meaning/example/source context using `expectedVersion`; mastery, status and review schedule
remain server-owned. Semantic identity and review-lock behavior are documented in
`docs/adr/0009-vocabulary-word-identity-and-concurrency.md`.

`POST /api/v1/vocabulary/context-analysis` requires verified email and a UUID
`Idempotency-Key`. It atomically reserves quota, stores a seven-day analysis and enqueues
`VOCABULARY_CONTEXT_ANALYSIS`; `GET /api/v1/vocabulary/context-analyses/{id}` polls the result.
`POST /api/v1/vocabulary/words` saves 1–20 selected suggestions with semantic upsert behavior.
Dev/test use an explicitly labeled deterministic fake extraction adapter. See
`docs/adr/0010-asynchronous-vocabulary-context-analysis.md`.

Vocabulary review now has a server-owned session lifecycle. `POST
/api/v1/vocabulary/review-sessions` creates an idempotent ordered snapshot from explicit word IDs
or up to 20 due words. `GET /api/v1/vocabulary/review-sessions/{id}` and `GET
/api/v1/vocabulary/review-sessions/active` restore that snapshot after refresh. A partial unique
index limits each user to one active review. Rating and undo atomically update the session, word
schedule and audit snapshots. Complete publishes `VocabularyReviewCompleted`; complete and abandon
are versioned/idempotent terminal operations that release all selected word locks. A configurable
cleanup abandons inactive sessions after 24 hours by default using bounded, skip-locked batches. See
`docs/adr/0011-vocabulary-review-session-snapshot.md`.

B05 registers `progress-activity-ledger-v1` for `VocabularyReviewCompleted`. Migration V7 stores an
immutable activity ledger with event and logical-source deduplication; the session timezone snapshot
determines the historical activity date. Consumer persistence and fenced delivery acknowledgement
commit together. See
`docs/adr/0012-progress-activity-ledger.md`.

B09 starts with migration V12 and the ledger-derived daily projection. A newly accepted review or
speaking ledger entry atomically increments the matching source bucket; duplicate event or logical
source inserts do not touch the projection. `GET /api/v1/progress/daily?from=YYYY-MM-DD&to=YYYY-MM-DD`
returns a dense series for at most 366 days, and `GET /api/v1/progress/overview` returns total
minutes, current streak, today's seconds and the learner's daily goal. Historical dates remain
bound to each child session's timezone snapshot, while the definition of today uses the learner's
current timezone. See `docs/adr/0021-progress-daily-projection.md`.

Migration V13 adds mistake patterns and immutable occurrences. Successful speaking evaluation now
publishes `SpeakingEvaluationCompleted` with deterministic feedback item IDs. The progress consumer
groups only versioned taxonomy keys and assigns each unclassified correction its own
`unknown:<feedbackItemId>` key. `GET /api/v1/progress/mistakes` and
`GET/PATCH /api/v1/progress/mistakes/{id}` provide paginated owner-scoped history and optimistic
status changes without deleting occurrences. Overview recommendation is deterministic: overdue
vocabulary, then an active mistake, then a compatible speaking topic. See
`docs/adr/0022-speaking-feedback-mistake-projection.md`.

Migration V14 adds versioned daily projection generations. The internal
`ProgressProjectionMaintenance.rebuildDaily(ruleVersion)` command builds from the immutable ledger,
performs a locked catch-up, validates total seconds and atomically switches the active reader/writer
pointer. Partial or invalid generations are never served; the previous generation is retained as
`RETIRED`. This command is intentionally not an HTTP endpoint. See
`docs/adr/0023-versioned-progress-projection-rebuild.md`.

B06 speaking foundation starts with migration V8 and a four-topic catalog. Authenticated clients can
filter `GET /api/v1/speaking/topics`, create an idempotent session, restore its detail/active state,
and abandon it with optimistic concurrency. Each session owns immutable topic and timezone
snapshots. See
`docs/adr/0013-speaking-topic-and-session-snapshot.md`.

Migration V9 adds speaking attempt metadata. `POST /api/v1/speaking/sessions/{id}/attempts` validates
the requested audio type/20 MiB limit and returns a ten-minute upload instruction; `POST
/api/v1/speaking/attempts/{id}/upload-url` renews it with optimistic concurrency. Object keys are
server-generated. The dev/test signer returns an explicit `.invalid` fixture and never marks audio
available. `POST /api/v1/speaking/attempts/{id}/upload-complete` asks the storage adapter to inspect
the stored object, verifies its SHA-256, size, detected MIME and 2-180 second duration, then seals an
immutable object version in a short transaction. Repeating completion with the same checksum is
idempotent. `GET /api/v1/speaking/attempts/{id}/audio` returns a 60-second playback grant with
`Cache-Control: no-store`, only while the sealed audio is retained. A production deployment must
provide the real inspection/signing adapter. The configurable hourly retention worker deletes each
expired versioned object before atomically changing its metadata to `DELETED`; storage errors leave
the row retryable without blocking the rest of the batch. Configure it with
`SPEAKING_AUDIO_RETENTION_CLEANUP_ENABLED`, `SPEAKING_AUDIO_RETENTION_CLEANUP_INTERVAL` and
`SPEAKING_AUDIO_RETENTION_CLEANUP_BATCH_SIZE`. See
`docs/adr/0014-speaking-attempt-upload-contract.md`.

B07 uses migration V10 and a durable one-evaluation-per-attempt resource. `POST
/api/v1/speaking/attempts/{id}/evaluate` checks the paid-work guard, session/attempt ownership,
verified retained audio and quota before atomically reserving quota, enqueueing a
`SPEAKING_EVALUATION` job and moving attempt processing to `QUEUED`. It returns `202` with
`Location`, `Retry-After: 2` and idempotency replay metadata. `GET
/api/v1/speaking/attempts/{id}/evaluation` supports owner-scoped polling. The worker persists a
transcript checkpoint before feedback; retry at `FEEDBACK` reuses that transcript and does not call
STT again. Validated result JSON, normalized feedback items, attempt completion and quota
consumption commit together after rechecking the session is still active. Dev/test uses a
deterministic adapter whose output is explicitly `source=fake`; production requires real STT and
feedback beans. Session detail now includes its attempts and evaluations, while `GET
/api/v1/speaking/sessions?page=0&size=20` returns bounded history. `POST
/api/v1/speaking/sessions/{id}/complete` requires an evaluated selected attempt, optimistic
version and idempotency key; it waits until no evaluation is queued/running. Completion sums the
verified duration of every successfully evaluated attempt, publishes one `SpeakingSessionCompleted`
event, and the progress consumer records it against the immutable session-timezone date. See
`docs/adr/0015-speaking-evaluation-resource-and-enqueue.md`,
`docs/adr/0016-speaking-stt-feedback-checkpoints.md` and
`docs/adr/0017-speaking-session-completion.md`.

Provider adapters must classify failures as timeout, rate-limited, unavailable, authentication
failure or rejected request. Speaking maps these to stable stage-specific codes such as
`STT_TIMEOUT` and `FEEDBACK_AUTHENTICATION_FAILED`. Retryable failures use the platform backoff;
terminal failures and invalid provider responses immediately finalize the job and evaluation.
Timeouts are enforced by each concrete HTTP adapter rather than by an outer worker future, so a
timed-out request cannot continue invisibly after its job lease is released. See
`docs/adr/0018-provider-failure-taxonomy.md`.

B08 starts with migration V11 and the Study orchestration aggregate. `POST /api/v1/study-sessions`
accepts exactly `[vocabulary]`, `[speaking]` or `[vocabulary, speaking]`, creates the parent and
new child sessions in one transaction, and stores ordered UUID links without cross-module JPA
associations. Existing independent active Study, vocabulary or speaking sessions return
`ACTIVE_SESSION_EXISTS`; they are never silently attached. Child idempotency keys are derived from
the parent request/session/position, while the outer key replays the complete parent response.
`GET /api/v1/study-sessions/{id}` and `GET /api/v1/study-sessions/active` return owner-scoped
state with each child status. Study links are removed before progress and child modules during
checkpointed account deletion. See `docs/adr/0019-study-parent-and-child-creation.md`.

`PATCH /api/v1/study-sessions/{id}/step` advances exactly one position after the current child is
`completed`, using parent `expectedVersion`. `POST /api/v1/study-sessions/{id}/complete` is
idempotent and succeeds only when every child completed; it emits no duration event because child
completion events already feed progress. `POST /api/v1/study-sessions/{id}/abandon` preserves
completed children and idempotently abandons only children still in progress before transitioning
the parent. See `docs/adr/0020-study-lifecycle-orchestration.md`.

## Verification

```powershell
.\mvnw.cmd verify
```

Surefire runs unit and architecture tests. Failsafe runs integration tests named `*IT` with
Testcontainers and PostgreSQL. Docker must be running for integration tests.

## Restore drill

`scripts/invoke-postgres-restore-drill.ps1` creates a custom-format backup from the local Compose
PostgreSQL service, restores it into a generated isolated database, validates Flyway/audio metadata
and writes checksum/timing evidence under `target/restore-drill`. The restored database is kept by
default for inspection. See `docs/runbooks/postgresql-restore-drill.md` for the safety boundary,
storage reconciliation and production-like evidence requirements.

The k6 speaking load-test harness is at backend/load-tests/speaking-evaluation.js; its controlled-run
procedure and guardrails are documented in docs/runbooks/speaking-load-test.md. Release approval
uses docs/runbooks/release-checklist.md.

## Platform runtime

B01 currently provides a PostgreSQL-backed job queue and transactional outbox/event dispatcher.
Both use `FOR UPDATE SKIP LOCKED`, expiring leases and generation fencing. Job handlers and event
consumers are registered as Spring beans through `JobHandler` and `EventConsumer`.

Runtime settings are under `heymimic.jobs` and `heymimic.events`. The environment flags
`JOBS_ENABLED` and `EVENTS_ENABLED` can disable polling; both schedulers are disabled by the test
profile. Defaults use a 120-second lease, a batch of 10 and at most 5 attempts.

External provider calls belong inside handlers, after the claim transaction has committed. Event
consumers are at-least-once and must be idempotent. See
`docs/adr/0002-postgresql-platform-runtime.md` for recovery and deployment constraints.

`IdempotencyExecutor` executes a mutation and stores its JSON response in the same transaction.
`QuotaManager` reserves, consumes or releases paid-work quota using UTC daily buckets and a
PostgreSQL advisory lock. Daily limits are controlled only by the validated
`heymimic.quotas.daily-limits` map. See `docs/adr/0003-idempotency-and-quota-guards.md`.

## Audited event-delivery replay

`EventDeliveryReplay` is a trusted internal application command and is not exposed through HTTP.
Only `FAILED_FINAL` deliveries are eligible. Every missing, rejected, dry-run or successful
request writes `platform_delivery_replay_audit` with the operator identity, reason and original
failure metadata. Run a dry-run first, then replay only after the consumer fix has been deployed.
Replay keeps the original event identity, clears lease/error state and grants a fresh retry budget.

Do not place credentials, signed URLs, transcripts or payloads in the replay reason. Detailed
procedure and trade-offs are in `docs/adr/0025-audited-event-delivery-replay.md`.

## Version baseline

| Tool | Pinned/tested version |
|---|---|
| Java | 21 |
| Spring Boot | 4.1.1 |
| Maven Wrapper | 3.9.16 |
| PostgreSQL image | 17.6-alpine |
| ArchUnit | 1.4.1 |
| Testcontainers | 2.0.5 |
| Spotless Maven Plugin | 2.46.1 |
| Maven Failsafe | 3.5.6 |
| Bouncy Castle | 1.81 |
| AWS SDK S3 | 2.31.29 |

Versions managed by the Spring Boot BOM are not overridden without an ADR.

## Resend identity email adapter

Dev and test profiles keep the in-memory sender so local auth tests never send mail. Staging and
production can set IDENTITY_EMAIL_PROVIDER=resend; the adapter requires RESEND_API_KEY,
IDENTITY_EMAIL_FROM and PUBLIC_APP_URL before the application starts. Verification and reset
links contain only the one-time token in the URL; provider failures map to retryable, rate-limited
or terminal job outcomes without logging the token. See docs/adr/0026-resend-identity-email.md.

## Claude language provider adapter

Dev/test keep the deterministic extraction and speaking evaluation adapters. Staging and production can
set AI_PROVIDER=anthropic; the application then requires ANTHROPIC_API_KEY and ANTHROPIC_MODEL and
calls Claude through the server-side Messages API client. ANTHROPIC_API_BASE_URL can point to a local
HTTP fixture for contract tests, while AI_REQUEST_TIMEOUT and AI_MAX_OUTPUT_TOKENS bound each request.

The vocabulary and speaking adapters request JSON only and validate the response before returning the
application ports. Rate limits, timeouts and 5xx responses are retryable; authentication, rejected
requests and malformed model output are terminal. The adapters never log source text, transcript,
prompt or API key. Configure the provider on staging only after a smoke test with a spend cap. See
docs/adr/0027-anthropic-provider-adapters.md and the official
Anthropic Messages API reference: https://docs.anthropic.com/en/api/messages.

Staging and production can use the versioned S3 storage and Deepgram prerecorded adapter. S3
inspection reads the sealed object version, computes SHA-256, identifies the container with ffprobe
and rejects version drift; Deepgram receives bytes only after that seal. Dev/test still use fake
storage/evaluation. Orphan cleanup, browser recovery and real provider smoke tests remain open. See
docs/adr/0028-versioned-s3-deepgram-audio.md.

Provider calls are recorded in platform_provider_usage by operation, stage and worker execution attempt. Successful calls keep provider request-id and usage metadata when available; timeouts or uncertain outcomes are recorded as UNKNOWN for later reconciliation. When enabled, workers reserve a configured global rate-card budget before provider calls and reconcile known usage afterward; UNKNOWN keeps its reservation. See docs/adr/0029-provider-usage-receipts.md and docs/adr/0030-provider-budget-reservation-reconciliation.md.

## One-to-one peer speaking

The peer speaking slice is available under '/api/v1/peer'. GET /scenarios returns the published
catalog; authenticated clients can create an idempotent session, issue a single-use invite, accept
an invite, toggle readiness with an optimistic expectedVersion, start the room after both learners
are ready, and end it. PostgreSQL owns the session/participant/invite state; stale reservations are
expired and released before they can block a new session. Migrations V24 and V25 seed the initial
catalog. The browser UI keeps the preflight microphone check and sample room explicit until a media
provider (WebRTC/LiveKit) and realtime presence channel are enabled.