# ADR 0007: Learner profile concurrency and authenticated password change

- Status: Accepted
- Date: 2026-09-07

## Context

B03 exposes account and learner settings to a browser that may have multiple tabs. Requests must
derive ownership from the access token, avoid silently overwriting a newer profile, make onboarding
safe to retry, and invalidate every existing session after a password change.

## Decision

- `/api/v1/me/**` and `/api/v1/auth/change-password` use the JWT subject as the user ID. A client
  cannot submit or override an owner ID.
- Profile mutations carry `expectedVersion`. PostgreSQL updates only the row matching both user ID
  and version, then increments the version atomically. A stale request returns
  `409 PROFILE_VERSION_CONFLICT`.
- JPQL bulk mutations clear the persistence context automatically. This prevents a read in the same
  transaction from returning the entity state cached before the bulk update.
- Completing onboarding is write-once. Retrying the identical completed payload returns the current
  profile without increasing its version; a different payload returns
  `409 ONBOARDING_ALREADY_COMPLETED`.
- Password change requires a valid access token and the current password. Success changes the
  Argon2id hash, increments `authVersion`, revokes all refresh-token families and expires the browser
  refresh cookie in one transaction.
- Public auth routes are allowlisted individually. `/api/v1/auth/**` is not permitted as a wildcard,
  so adding a sensitive route cannot accidentally make it anonymous.

## Consequences

- Clients must retain and submit the latest profile version and handle conflicts by reloading.
- Access tokens require a database-backed active-session/auth-version check, already provided by the
  identity JWT validator.
- Onboarding retry equality is based on canonical API values. Future normalization changes must be
  versioned or kept compatible with stored values.
- Integration coverage requires PostgreSQL Testcontainers; Docker must be running locally or in CI.
