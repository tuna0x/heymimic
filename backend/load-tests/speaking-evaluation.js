import http from 'k6/http';
import { check, fail } from 'k6';
import { sha256 } from 'k6/crypto';

const baseUrl = (__ENV.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const accessToken = __ENV.ACCESS_TOKEN;
const sessionId = __ENV.SPEAKING_SESSION_ID;
const attemptId = __ENV.SPEAKING_ATTEMPT_ID;
const fixturePath = __ENV.AUDIO_FIXTURE_PATH;
const fixture = fixturePath ? open(fixturePath, 'b') : null;
const uploadEnabled = __ENV.RUN_UPLOAD === 'true';

export const options = {
  scenarios: {
    evaluation_polling: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.POLL_RATE || 20),
      timeUnit: '1s',
      duration: __ENV.DURATION || '2m',
      preAllocatedVUs: Number(__ENV.POLL_VUS || 20),
      maxVUs: Number(__ENV.POLL_MAX_VUS || 100),
      exec: 'pollEvaluation'
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    checks: ['rate>0.98']
  }
};

if (uploadEnabled) {
  options.scenarios.upload_and_evaluate = {
    executor: 'constant-arrival-rate',
    rate: Number(__ENV.UPLOAD_RATE || 1),
    timeUnit: '1s',
    duration: __ENV.DURATION || '2m',
    preAllocatedVUs: Number(__ENV.UPLOAD_VUS || 5),
    maxVUs: Number(__ENV.UPLOAD_MAX_VUS || 20),
    exec: 'uploadAndEvaluate'
  };
}

export function setup() {
  if (!accessToken) fail('ACCESS_TOKEN is required');
  if (!attemptId) fail('SPEAKING_ATTEMPT_ID is required for evaluation polling');
  if (uploadEnabled && (!sessionId || !fixture)) {
    fail('RUN_UPLOAD=true requires SPEAKING_SESSION_ID and AUDIO_FIXTURE_PATH');
  }
  return { accessToken };
}

export function pollEvaluation(data) {
  const response = http.get(
    baseUrl + '/api/v1/speaking/attempts/' + attemptId + '/evaluation',
    authenticatedHeaders(data.accessToken)
  );
  check(response, {
    'evaluation poll is successful': (result) => result.status === 200
  });
}

export function uploadAndEvaluate(data) {
  if (!fixture) fail('AUDIO_FIXTURE_PATH is required for upload_and_evaluate');

  const csrfResponse = http.get(baseUrl + '/api/v1/auth/csrf');
  const csrf = JSON.parse(csrfResponse.body);
  const idempotencyKey = uuid();
  const createResponse = http.post(
    baseUrl + '/api/v1/speaking/sessions/' + sessionId + '/attempts',
    JSON.stringify({ mimeType: 'audio/wav', sizeBytes: fixture.byteLength }),
    mutationHeaders(data.accessToken, csrf.token, idempotencyKey)
  );
  check(createResponse, {
    'attempt creation is accepted': (result) => result.status === 201
  });
  if (createResponse.status !== 201) return;

  const upload = JSON.parse(createResponse.body);
  const uploadHeaders = upload.requiredHeaders || {};
  const uploadResponse = http.put(upload.uploadUrl, fixture, { headers: uploadHeaders });
  check(uploadResponse, {
    'audio upload is accepted': (result) => result.status >= 200 && result.status < 300
  });
  if (uploadResponse.status < 200 || uploadResponse.status >= 300) return;

  const completeCsrfResponse = http.get(baseUrl + '/api/v1/auth/csrf');
  const completeCsrf = JSON.parse(completeCsrfResponse.body);
  const completeResponse = http.post(
    baseUrl + '/api/v1/speaking/attempts/' + upload.attempt.id + '/upload-complete',
    JSON.stringify({ checksumSha256: sha256(fixture, 'hex') }),
    mutationHeaders(data.accessToken, completeCsrf.token)
  );
  check(completeResponse, {
    'upload completion is accepted': (result) => result.status === 200
  });
  if (completeResponse.status !== 200) return;

  const evaluateCsrfResponse = http.get(baseUrl + '/api/v1/auth/csrf');
  const evaluateCsrf = JSON.parse(evaluateCsrfResponse.body);
  const evaluateResponse = http.post(
    baseUrl + '/api/v1/speaking/attempts/' + upload.attempt.id + '/evaluate',
    null,
    mutationHeaders(data.accessToken, evaluateCsrf.token, uuid())
  );
  check(evaluateResponse, {
    'evaluation is queued': (result) => result.status === 202
  });
}

function authenticatedHeaders(token) {
  return { headers: { Authorization: 'Bearer ' + token } };
}

function mutationHeaders(token, csrfToken, idempotencyKey) {
  const headers = {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrfToken
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return { headers };
}

function uuid() {
  const suffix = String(Date.now() * 1000 + __VU * 100 + __ITER).slice(-12);
  return '00000000-0000-4000-8000-' + suffix.padStart(12, '0');
}
