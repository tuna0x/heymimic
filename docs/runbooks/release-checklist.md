# HeyMimic backend release checklist

Use this checklist for a production-like release. A checked item needs an attached CI log, restore
evidence or change ticket; a green unit suite alone is not a release approval.

## Build and contract

- [ ] From backend, run .\mvnw.cmd verify with Docker-backed integration tests.
- [ ] frontend lint, tests and production build pass.
- [ ] backend/openapi/openapi.json was regenerated only for intentional controller changes.
- [ ] Database migration review confirms expand/contract compatibility with the previous app version.
- [ ] Container image is pinned, non-root and contains no .env, recordings or backup artifacts.

## Configuration and security

- [ ] Production JWT keys, issuer, audience, database credentials and allowed origins are injected
  at runtime; no placeholder/fake provider is active.
- [ ] MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE keeps metrics behind a private operations ingress.
- [ ] CSRF, secure cookies, trusted proxy headers, TLS and security headers were verified in the
  deployed ingress.
- [ ] Provider model/region/timeout/input-output limits, spend cap and retention policy are recorded.
- [ ] Database and worker pool sizes match the load-test evidence.

## Data safety and operations

- [ ] A recent backup exists and the PostgreSQL restore drill succeeded in a separate database.
- [ ] Restore evidence records observed RPO/RTO; targets (RPO ≤24h, RTO ≤4h) are not claimed without
  measurement.
- [ ] Audio-object manifest reconciles every AVAILABLE key/version/checksum with object storage.
- [ ] Account deletion, audio retention and replay audit retention policies are enabled.
- [ ] Alerts cover queue age, delivery lag, final failures, provider auth failures, storage cleanup
  failures and stale scheduler/queue observation gauges.
- [ ] On-call owner, rollback owner, dashboards and incident ticket are assigned.

## Deployment and rollback

- [ ] Run Flyway migrations before switching application readers/writers.
- [ ] Deploy the backward-compatible application release and verify health/readiness.
- [ ] Smoke-test register/login, vocabulary review, speaking upload/evaluation polling and progress.
- [ ] Watch queue and provider metrics through at least one worker lease interval.
- [ ] Roll back the application only while schema remains backward compatible; never undo a
  destructive migration automatically.
