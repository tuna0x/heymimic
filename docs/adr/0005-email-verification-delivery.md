# ADR 0005: Email verification delivery and token handling

- Status: Accepted
- Date: 2026-09-07

## Context

Registration must commit the identity user, learner profile and verification intent atomically.
Sending email inside that transaction would hold database resources across a network call and could
leave delivery state ambiguous. Persisting a raw verification token in the database, job payload or
logs would turn those systems into credential stores.

## Decision

- Registration enqueues a `SEND_VERIFICATION_EMAIL` platform job in the same transaction as the user
  and learner profile.
- The durable job contains only the owning user ID, purpose and schema version; it never contains a
  raw token.
- After a worker has claimed the job, the identity application generates a random 256-bit token,
  stores only its SHA-256 hash with a 24-hour expiry, and returns the raw token to the email adapter.
- The email provider call happens after the token transaction commits. A retry replaces and consumes
  the previous active verification token before sending a new one.
- Verification locks the matching token row, consumes it and marks the user verified in one
  transaction. Used and expired tokens return the same generic error.
- Resend always returns the same accepted response for missing, verified and unverified accounts.
- Development and test use an in-memory email adapter. Production must supply a real
  `IdentityEmailSender`; startup fails if none is configured.
- Request and response objects that carry passwords or tokens redact them from `toString()` output.

## Consequences

- Database and job inspection cannot reveal a usable verification credential.
- A provider failure can leave a committed but unsent token until the job retries; that token is
  invalidated by the retry and is never exposed elsewhere.
- Multiple resend requests can create multiple jobs. Whichever delivery is prepared last is the only
  active token, so an older email can become invalid.
- Production email provider selection, templates, sender identity and provider-level idempotency need
  a separate ADR before enabling email delivery.
