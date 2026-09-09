# ADR 0010: Asynchronous vocabulary context analysis

- Status: Accepted
- Date: 2026-09-07

## Context

Vocabulary extraction can call a paid, slow provider. HTTP requests must not hold database
transactions during that call, retries must not reserve quota or create analysis records twice, and
provider output is untrusted until validated.

## Decision

- `POST /api/v1/vocabulary/context-analysis` requires a UUID `Idempotency-Key`, verified email and
  an input of at most 10,000 characters.
- One transaction creates the idempotency result, reserves `CONTEXT_ANALYSIS` quota, enqueues a
  platform job and persists the pending analysis. The response is `202` with a polling URL.
- The job reads immutable analysis input, calls `VocabularyExtractionPort` outside its read
  transaction, validates at most 20 suggestions and conditionally stores versioned JSON output.
  Quota consumption joins the completion transaction.
- Extraction results carry explicit `source` provenance (`fake` or `provider`). The deterministic
  fake adapter is enabled only in dev/test. Production startup requires a real adapter before this
  core feature can be enabled.
- Polling and saving are owner-scoped. `POST /api/v1/vocabulary/words` accepts only suggestion IDs
  belonging to a completed, unexpired analysis.
- Saved words use a PostgreSQL `INSERT ... ON CONFLICT DO NOTHING` through the JPA repository, then
  read the canonical row. This makes repeated/concurrent saves return the same semantic word rather
  than incrementing learning state or creating duplicates.
- Context input/result expires after seven days and is included in account deletion cleanup.
- An hourly, configurable batch cleanup locks expired rows with `FOR UPDATE SKIP LOCKED`. It
  releases reservations for still-pending analyses and deletes terminal analyses without changing
  their already-final quota state; both actions share one transaction.
- When the platform job exhausts its retry budget, the generic `JobHandler` final-failure hook
  transitions a still-pending analysis to `failed`, persists a bounded error code and consumes the
  existing reservation. The conditional state transition makes repeated callbacks harmless.

## Consequences

- Provider retries may repeat an external call if a response is lost; a provider idempotency key
  should be added by the real adapter when supported.
- Terminal platform-job retention remains shared B11 hardening work and is intentionally separate
  from context payload retention.
- The API never treats fake extraction output as provider output and never renders provider text as
  HTML.
