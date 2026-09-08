# ADR 0009: Vocabulary word identity and concurrency

- Status: Accepted
- Date: 2026-09-07

## Context

Vocabulary words are user-owned learning state. Display spelling alone is not a stable identity:
one spelling may have multiple meanings or parts of speech, while extraction retries must not create
the same sense repeatedly. Profile edits and active review sessions can also race with word edits.

## Decision

- A saved sense is unique by `(user_id, target_language, normalized_word, sense_key)`.
- `sense_key` is SHA-256 over normalized target language, meaning and part of speech. Normalization
  uses Unicode NFKC, trimmed/collapsed whitespace and lowercase text.
- Word IDs and owner IDs are UUIDs. Controllers derive owner exclusively from the JWT subject and
  other-owner lookup is indistinguishable from missing data (`404 VOCABULARY_WORD_NOT_FOUND`).
- List queries are 0-based pages, capped at 100 items and sorted deterministically by
  `createdAt DESC, id DESC`. Filters currently support status and due-before time.
- Content PATCH may change meaning, example and source context. Mastery, status, interval and due
  time are server-controlled review state.
- PATCH requires `expectedVersion`; the database update checks owner, version and that no active
  review owns the word lock. Stale writes and active-review edits return stable conflicts.
- API status values are explicit lowercase strings; persistence uses uppercase enum values.

## Consequences

- Changing a meaning may collide with another saved sense and returns
  `409 VOCABULARY_WORD_DUPLICATE`.
- Presentation-only properties such as card color remain frontend concerns.
- Context extraction and review session code must reuse this normalization/identity rule when they
  create or mutate words.
