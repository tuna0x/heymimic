# ADR 0016: Speaking STT and feedback checkpoints

- Status: Accepted
- Date: 2026-09-08

## Context

Transcription and feedback are two remote, retryable stages. Repeating a successful transcription
because feedback failed wastes money and can produce inconsistent text. Database locks must not be
held while either provider is running, and a late result must not complete an abandoned session.

## Decision

- `SpeakingTranscriptionPort` and `SpeakingFeedbackPort` are separate outbound contracts. The job
  handler calls them outside application transactions.
- Preparing a queued evaluation locks its session, verifies the session is still `IN_PROGRESS` and
  audio remains `AVAILABLE`, then atomically moves evaluation to `RUNNING/TRANSCRIBING`, attempt to
  `RUNNING`, and records that provider work has been authorized.
- A successful STT result is validated and persisted before feedback starts. The durable stage then
  becomes `FEEDBACK`. If feedback or the worker fails afterward, the platform retries the same job;
  preparation returns the persisted transcript and the handler skips STT.
- Feedback is schema-validated before persistence: source is `fake` or `provider`, scores are
  bounded, strengths/corrections have count and length limits, and correction category is restricted
  to grammar, vocabulary or expression. Result JSON and normalized feedback rows are committed with
  the attempt transition to `COMPLETED` and quota consumption.
- Completion locks and rechecks the session. Results arriving after abandon do not complete the
  attempt; the evaluation becomes terminal failed instead.
- Final failure moves both evaluation and attempt to `FAILED`. A reservation is consumed after
  provider work was authorized and released if failure happened before provider invocation.
- `DevelopmentSpeakingEvaluationAdapter` is deterministic, enabled only by
  `heymimic.speaking.fake-evaluation=true`, and labels both transcript and feedback `source=fake`.
  It explicitly says the transcript is a fixture rather than claiming to have read uploaded audio.
  Production uses `false` and fails startup until real STT and feedback beans are supplied.

## Consequences

- STT success followed by feedback failure retries only feedback.
- Polling exposes the durable stage, so reload does not rely on browser memory.
- Provider latency does not extend database transactions.
- Marking provider work before the call is conservative: a crash in the narrow gap may consume a
  reservation without a confirmed response, avoiding accidental free repeated calls.
- Real adapters still need timeout/error classification, provider/model configuration and external
  integration tests before production enablement. The shared classification contract is defined in
  ADR 0018; each concrete adapter must enforce its own HTTP timeout and translate failures.
