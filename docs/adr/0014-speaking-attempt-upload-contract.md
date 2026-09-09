# ADR 0014: Speaking attempt upload contract and metadata ownership

- Status: Accepted
- Date: 2026-09-08

## Context

Speaking audio must be uploaded directly to private object storage without letting clients choose
object keys or claim unverified MIME, size, checksum or duration. Upload URLs expire, while retries
must preserve one logical attempt and its attempt number.

## Decision

- Migration V9 introduces `speaking_attempts` with server-owned object keys, per-session attempt
  numbers, requested MIME/size, upload expiry, object version, checksum, verified duration, audio and
  processing states, retention timestamp and optimistic version.
- Attempt creation accepts only `audio/webm`, `audio/ogg`, `audio/mp4` and `audio/wav`, rejects empty
  files and caps requested size at 20 MiB. It locks the owned `IN_PROGRESS` session before assigning
  the next attempt number and requires a UUID `Idempotency-Key`.
- Upload instructions expire after ten minutes. Retrying create with the same key replays the
  original instruction; `POST /api/v1/speaking/attempts/{id}/upload-url` issues a fresh instruction
  only for an owned `AWAITING_UPLOAD` attempt at the supplied `expectedVersion`.
- `AudioObjectStorage` owns provider-specific signing. The application owns validation, object-key
  construction and attempt state. Storage URLs and object keys are never accepted from request
  bodies.
- `DevelopmentAudioObjectStorage` is enabled only by the explicit dev/test `fake-storage` flag. Its
  `.invalid` URL is a contract fixture and cannot make an attempt available. Production starts
  without this flag and therefore requires a real storage adapter bean.
- `POST /api/v1/speaking/attempts/{id}/upload-complete` validates a client SHA-256 request but trusts
  only metadata returned by `AudioObjectStorage.inspectAndSeal`: immutable object version, computed
  SHA-256, byte size, detected MIME and decoded duration. Size and MIME must equal the create
  declaration and duration must be 2-180 seconds. The storage call runs outside the database
  transaction; a dedicated committer then locks session followed by attempt and atomically moves the
  attempt to `AVAILABLE` with seven-day retention. A same-checksum retry is idempotent; a different
  checksum or terminal state conflicts.
- `GET /api/v1/speaking/attempts/{id}/audio` checks ownership, `AVAILABLE` state and retention before
  returning a version-bound playback grant valid for 60 seconds with `Cache-Control: no-store`.
  Deleted or expired audio returns `410 AUDIO_EXPIRED`.
- The retention scheduler reads bounded batches of expired `AVAILABLE` attempts without holding a
  transaction across storage I/O. It calls the adapter's idempotent delete operation with object key
  and immutable version first, then uses a short transaction and optimistic version predicate to
  mark metadata `DELETED`. A storage failure leaves metadata unchanged for retry and does not stop
  later items in the batch. Duplicate work across application instances is safe because both object
  deletion and the metadata transition are idempotent.
- Account deletion removes attempts before sessions to respect foreign keys; provider-object deletion
  will join the cleaner once a real storage adapter is configured.

## Consequences

- Expired upload URLs do not require creating duplicate attempts.
- Session history can preserve attempt metadata independently of temporary signed URLs.
- The development adapter cannot accidentally masquerade as successful uploaded audio.
- Slow storage inspection/decoding does not hold session or attempt database locks.
- Until a real adapter exists, successful completion cannot run in dev/test by design. The fake
  adapter's delete operation is a no-op because it never persists bytes.
- V9 constraints and JPA queries require PostgreSQL integration verification with Docker.
