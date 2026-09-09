# ADR 0026: Resend identity email delivery

## Status

Accepted for the M1 staging/prod adapter. Provider smoke delivery remains a release gate and
requires an account-owned API key and verified sender domain.

## Context

The identity module already creates verification and password-reset jobs and exposes an
IdentityEmailSender port. Dev/test must remain deterministic and must never send a real message.
Production needs a concrete provider, bounded HTTP timeouts, and failure outcomes that the existing
PostgreSQL job worker can retry without exposing one-time tokens.

## Decision

Use Resend's HTTPS email endpoint behind a ResendIdentityEmailSender adapter. The adapter is
created only for the prod or staging profile when IDENTITY_EMAIL_PROVIDER=resend. It requires:

- RESEND_API_KEY
- IDENTITY_EMAIL_FROM
- PUBLIC_APP_URL

Requests use the configured connect/read timeout and send a small HTML message with a verification
or reset link. The token is URL-encoded and is never logged. Dev/test continue to use the
in-memory sender.

HTTP 401/403 and other non-rate-limited 4xx responses become terminal job failures. HTTP 429 and
5xx responses, connection failures, and timeouts become retryable outcomes. The existing worker
controls backoff and final-failure handling.

## Consequences

Provider credentials stay backend-only and can be rotated without changing identity application
code. A staging smoke test must verify the sender domain, link target, and one-time token flow.
The provider is an operational dependency; if it is unavailable, delivery jobs retry and the user
can request a new link subject to the existing rate limits.
