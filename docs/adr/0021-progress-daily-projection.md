# ADR 0021: Ledger-derived daily progress projection

- Status: Accepted
- Date: 2026-09-08

## Context

Dashboard and progress history need low-cost daily totals and streaks. Review and speaking
completion are delivered at least once, while the immutable activity ledger already rejects both a
repeated event ID and a second event for the same logical child session. Projection updates must
not count either replay.

## Decision

- Migration V12 introduces `progress_daily_activities`, keyed by `(user_id, activity_date)`.
  Vocabulary and speaking seconds are separate additive buckets. The row also stores the latest
  contributing timezone snapshot and projection watermark.
- Each completion consumer first inserts its ledger entry. It updates the daily projection only
  when that insert reports a new logical activity. Both writes join the same consumer transaction;
  a failed projection or lost delivery fence rolls back the ledger insert as well.
- PostgreSQL `INSERT ... ON CONFLICT DO UPDATE` increments the selected source bucket atomically.
  A day qualifies for streak once the combined accepted duration reaches 60 seconds.
- Historical `activity_date` remains the date derived from the child session's timezone snapshot.
  Overview resolves today using the learner profile's current timezone and does not rewrite
  historical rows when that profile changes.
- Current streak ends today when today qualifies. If today does not yet qualify, it may end
  yesterday. A missing or non-qualifying earlier day breaks the streak.
- Total minutes is the floor of all accepted seconds divided by 60. Daily history is dense, includes
  explicit zero days, and is limited to 366 inclusive dates.
- The projection watermark is the newest ledger occurrence represented by any daily row for the
  user. The current writer has no ledger/projection gap because both writes are transactional;
  platform delivery backlog visibility will be added with the remaining B09 projection work.

## Consequences

- Dashboard reads no review, speaking, or study tables and does not count `StudyCompleted`.
- A replay that loses either ledger uniqueness constraint cannot increment daily totals.
- The latest timezone snapshot on an aggregate row is explanatory only; the immutable ledger
  retains the exact snapshot for every contributing activity.
- V12 and the atomic upsert need PostgreSQL integration verification. The Testcontainers assertion
  is present, but local execution still requires a running Docker daemon.
- Mistake projection, recommendation ordering and online rebuild/swap remain separate B09 slices.
