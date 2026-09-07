# ADR 0006: Password recovery and authentication rate limits

- Status: Accepted
- Date: 2026-09-07

## Context

Password recovery must not reveal whether an email exists, and a completed reset must invalidate
every existing session immediately. Public authentication endpoints also need limits that remain
correct across application restarts and concurrent instances.

## Decision

- Forgot-password uses the platform job queue and the same email-token table with purpose `RESET`.
  Job payloads never contain raw tokens; workers generate 256-bit tokens and persist only SHA-256
  hashes with a 30-minute expiry.
- Reset consumes the token, writes a new Argon2id password hash, increments `authVersion`, and
  revokes every session family for the user in one transaction.
- Forgot-password returns the same `202` body for existing and missing accounts.
- Authentication limits use PostgreSQL fixed-window counters keyed by scope and SHA-256 subject
  hash. Counter increments use atomic upsert and an independent transaction so rejected business
  requests cannot roll the security counter back.
- Login permits ten failed attempts per 15-minute window for both email and client-address keys.
  Forgot-password and resend-verification share limits of three requests per email and twenty per
  client address per hour.
- A rejected request returns Problem Details code `RATE_LIMIT_EXCEEDED`, HTTP 429 and a
  `Retry-After` header. Limits expire naturally by window; accounts are never permanently locked.
- The application uses the servlet remote address. A production reverse proxy must be configured as
  the trusted source of the real client address and must strip untrusted forwarding headers.

## Consequences

- Limits work across replicas and restarts without adding Redis to the initial architecture.
- Fixed windows are simpler but allow bursts around a window boundary; switch to a sliding window
  only if measured abuse justifies the extra storage and queries.
- Expired counter cleanup is part of the platform retention worker before production hardening.
