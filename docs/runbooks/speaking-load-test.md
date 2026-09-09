# Speaking upload/evaluation load test

The repository includes a k6 harness at backend/load-tests/speaking-evaluation.js. It measures
authenticated evaluation polling and, when a real audio fixture is supplied, the
create-attempt -> presigned-upload -> seal -> evaluate path.

This is a staging/controlled-environment test. It can authorize paid provider work and create
audio objects. Use a deterministic fake evaluator only in development, or set a bounded staging
quota and budget before running against real providers.

## Preconditions

- k6 is installed and the backend is reachable.
- ACCESS_TOKEN belongs to a verified test account.
- SPEAKING_ATTEMPT_ID identifies an existing evaluation resource for polling.
- For upload flow, SPEAKING_SESSION_ID is an active owned session and AUDIO_FIXTURE_PATH points
  to a valid 2–180 second audio file accepted by the configured storage inspection adapter.
- The storage signer must return an upload URL reachable from the k6 runner.

## Polling-only run

~~~powershell
$env:BASE_URL='https://staging.example.com'
$env:ACCESS_TOKEN='replace-with-short-lived-token'
$env:SPEAKING_ATTEMPT_ID='00000000-0000-0000-0000-000000000000'
$env:DURATION='5m'
$env:POLL_RATE='50'
k6 run backend/load-tests/speaking-evaluation.js
~~~

## Upload/evaluation run

Set RUN_UPLOAD=true, AUDIO_FIXTURE_PATH and SPEAKING_SESSION_ID to explicitly enable the upload
scenario:

~~~powershell
$env:RUN_UPLOAD='true'
$env:SPEAKING_SESSION_ID='00000000-0000-0000-0000-000000000000'
$env:AUDIO_FIXTURE_PATH='D:\fixtures\sample-5s.wav'
$env:UPLOAD_RATE='2'
$env:POLL_RATE='20'
k6 run backend/load-tests/speaking-evaluation.js
~~~

The defaults are intentionally modest: 20 polling arrivals/second and 1 upload flow/second for
two minutes. Increase one dimension at a time while watching database connections, queue age,
delivery lag, provider quotas and storage request errors.

## Acceptance evidence

Record the k6 summary, commit/release identifier, fixture checksum, environment region, database
pool settings, worker concurrency, queue gauges and provider/storage mode. The initial engineering
guardrails are HTTP error rate below 2%, p95 below 500 ms and p99 below 1 s; these are test
guardrails, not production SLO commitments. Stop the run if queue age or delivery lag crosses the
alerts documented in the backend README.
