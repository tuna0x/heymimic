# ADR 0019: Study parent and child session creation

- Status: Accepted
- Date: 2026-09-08

## Context

A Study session coordinates vocabulary review and speaking without making either child module
depend on Study. The combined create operation must not leave orphaned parents, partially created
children or completed idempotency records when any child validation fails. It must also avoid
silently adopting an independent active session.

## Decision

- V11 adds `study_sessions` and ordered `study_steps`. A partial unique index permits one
  `IN_PROGRESS` Study parent per user.
- A step stores UUID links only. Database checks require `VOCABULARY` to have exactly one review
  link and `SPEAKING` to have exactly one speaking link. Child links and parent positions are
  unique.
- The accepted plans are exactly one vocabulary step, one speaking step, or vocabulary followed by
  speaking. Duplicate/reversed kinds, null/duplicate word IDs, more than 50 word IDs, mixed child
  fields and a speaking step without topic ID are rejected as `INVALID_STUDY_PLAN`.
- Before creating a parent, Study checks active Study, review and speaking contracts. Any existing
  active resource returns `ACTIVE_SESSION_EXISTS`; independent sessions are never attached.
  Database partial unique constraints remain the final guard for concurrent creates.
- Study creates a fresh parent, calls `ReviewSessions.start` and/or `SpeakingPractice.start`, then
  writes ordered links. The public `start` method is one transaction, so parent, children, links,
  quota-neutral child work and nested idempotency records commit or roll back together.
- The external idempotency key protects the complete Study operation. Deterministic UUID child keys
  are derived from user, external request key, parent ID and step position; clients never see or
  manage them.
- Study reads child state only through each module's application public API. It does not import
  child domain, persistence, port or HTTP DTO classes; an architecture test enforces this boundary.
- Study owns the links, so account deletion removes Study before progress, speaking and vocabulary
  cleaners.

## Consequences

- A combined request cannot expose a half-created learning flow after an application error.
- Child modules remain usable independently and have no reverse dependency on Study.
- Parent detail can explain current child states without duplicating child business data.
- The transaction intentionally spans module services because they share one PostgreSQL database
  inside the modular monolith. Extracting a child into another service would require replacing this
  decision with a saga/outbox workflow.
- Step transition, terminal completion and cascading abandon are defined in ADR 0020.
