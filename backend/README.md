# HeyMimic backend

Spring Boot modular monolith for HeyMimic. Java 21 and PostgreSQL are required.

## Local development

```powershell
docker compose up -d postgres
cd backend
.\mvnw.cmd spring-boot:run
```

The API uses `/api/v1`; health is available at `/actuator/health`.

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

## Verification

```powershell
.\mvnw.cmd verify
```

Surefire runs unit and architecture tests. Failsafe runs integration tests named `*IT` with
Testcontainers and PostgreSQL. Docker must be running for integration tests.

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

Versions managed by the Spring Boot BOM are not overridden without an ADR.
