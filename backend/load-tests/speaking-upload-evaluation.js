import crypto from 'k6/crypto';
import exec from 'k6/execution';
import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

const baseUrl = (__ENV.BASE_URL || '').replace(/\/$/, '');
const usersFile = __ENV.USERS_FILE || '';
const audioFile = __ENV.AUDIO_FILE || '';
if (!baseUrl || !usersFile || !audioFile) {
  throw new Error('BASE_URL, USERS_FILE and AUDIO_FILE are required');
}

const users = new SharedArray('load users', function () {
  const parsed = JSON.parse(open(usersFile));
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('USERS_FILE must contain a non-empty JSON array');
  }
  parsed.forEach(function (user, index) {
    if (!user.email || !user.password) {
      throw new Error('Load user at index ' + index + ' requires email and password');
    }
  });
  return parsed;
});
const audio = open(audioFile, 'b');
const audioBytes = new Uint8Array(audio).byteLength;
const audioMimeType = __ENV.AUDIO_MIME_TYPE || 'audio/webm';
const audioChecksum = crypto.sha256(audio, 'hex');
const virtualUsers = Number(__ENV.VUS || 5);
const iterations = Number(__ENV.ITERATIONS_PER_VU || 1);
const pollIntervalSeconds = Number(__ENV.POLL_INTERVAL_SECONDS || 1.5);
const evaluationTimeoutSeconds = Number(__ENV.EVALUATION_TIMEOUT_SECONDS || 90);
const requireRealProviders = (__ENV.REQUIRE_REAL_PROVIDERS || 'true').toLowerCase() === 'true';

if (users.length < virtualUsers) {
  throw new Error('USERS_FILE must contain at least VUS unique accounts');
}
if (audioBytes <= 0 || audioBytes > 20 * 1024 * 1024) {
  throw new Error('AUDIO_FILE must be between 1 byte and 20 MiB');
}

const apiDuration = new Trend('speaking_api_duration', true);
const uploadDuration = new Trend('speaking_upload_duration', true);
const evaluationEndToEnd = new Trend('speaking_evaluation_e2e_duration', true);
const flowSuccess = new Rate('speaking_flow_success');

export const options = {
  discardResponseBodies: false,
  scenarios: {
    speaking_upload_evaluation: {
      executor: 'per-vu-iterations',
      vus: virtualUsers,
      iterations: iterations,
      maxDuration: __ENV.MAX_DURATION || '10m',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    speaking_api_duration: ['p(95)<1000', 'p(99)<2000'],
    speaking_upload_duration: ['p(95)<5000'],
    speaking_evaluation_e2e_duration: ['p(95)<90000'],
    speaking_flow_success: ['rate>0.95'],
  },
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function parseJson(response, operation) {
  try {
    return response.json();
  } catch (error) {
    fail(operation + ' returned non-JSON response with status ' + response.status);
  }
}

function expectStatus(response, accepted, operation) {
  const checks = {};
  checks[operation + ' status'] = function (result) {
    return accepted.indexOf(result.status) >= 0;
  };
  const passed = check(response, checks);
  if (!passed) {
    fail(operation + ' failed with status ' + response.status);
  }
}

function apiRequest(method, path, body, context, operation, extraHeaders) {
  const headers = Object.assign(
    {
      Authorization: 'Bearer ' + context.accessToken,
      'Content-Type': 'application/json',
    },
    extraHeaders || {}
  );
  if (context.csrfHeader && context.csrfToken) {
    headers[context.csrfHeader] = context.csrfToken;
  }
  const response = http.request(
    method,
    baseUrl + path,
    body === null || body === undefined ? null : JSON.stringify(body),
    { headers: headers, tags: { operation: operation } }
  );
  apiDuration.add(response.timings.duration, { operation: operation });
  return response;
}

function authenticate(user) {
  const csrfResponse = http.get(baseUrl + '/api/v1/auth/csrf', {
    tags: { operation: 'csrf' },
  });
  apiDuration.add(csrfResponse.timings.duration, { operation: 'csrf' });
  expectStatus(csrfResponse, [200], 'csrf');
  const csrf = parseJson(csrfResponse, 'csrf');
  const context = {
    accessToken: '',
    csrfHeader: csrf.headerName,
    csrfToken: csrf.token,
  };
  const loginResponse = apiRequest(
    'POST',
    '/api/v1/auth/login',
    { email: user.email, password: user.password },
    context,
    'login'
  );
  expectStatus(loginResponse, [200], 'login');
  context.accessToken = parseJson(loginResponse, 'login').accessToken;
  if (!context.accessToken) {
    fail('login response did not contain accessToken');
  }
  return context;
}

function selectTopic(context) {
  if (__ENV.TOPIC_ID) {
    return __ENV.TOPIC_ID;
  }
  const response = apiRequest('GET', '/api/v1/speaking/topics', null, context, 'topics');
  expectStatus(response, [200], 'topics');
  const topics = parseJson(response, 'topics');
  if (!Array.isArray(topics) || topics.length === 0 || !topics[0].id) {
    fail('No speaking topic is available');
  }
  return topics[0].id;
}

function abandonSession(context, sessionId) {
  const detailResponse = apiRequest(
    'GET',
    '/api/v1/speaking/sessions/' + sessionId,
    null,
    context,
    'cleanup_session_detail'
  );
  if (detailResponse.status !== 200) {
    return;
  }
  const session = parseJson(detailResponse, 'cleanup session detail');
  if (session.status !== 'in_progress') {
    return;
  }
  apiRequest(
    'POST',
    '/api/v1/speaking/sessions/' + sessionId + '/abandon',
    { expectedVersion: session.version },
    context,
    'cleanup_abandon',
    { 'Idempotency-Key': uuid() }
  );
}

export default function () {
  const user = users[(exec.vu.idInTest - 1) % users.length];
  const context = authenticate(user);
  let sessionId = null;
  let completed = false;

  try {
    const topicId = selectTopic(context);
    const sessionResponse = apiRequest(
      'POST',
      '/api/v1/speaking/sessions',
      { topicId: topicId },
      context,
      'create_session',
      { 'Idempotency-Key': uuid() }
    );
    expectStatus(sessionResponse, [201], 'create session');
    const session = parseJson(sessionResponse, 'create session');
    sessionId = session.id;

    const attemptResponse = apiRequest(
      'POST',
      '/api/v1/speaking/sessions/' + sessionId + '/attempts',
      { mimeType: audioMimeType, sizeBytes: audioBytes },
      context,
      'create_attempt',
      { 'Idempotency-Key': uuid() }
    );
    expectStatus(attemptResponse, [201], 'create attempt');
    const upload = parseJson(attemptResponse, 'create attempt');
    if (!upload.attempt || !upload.attempt.id || !upload.uploadUrl) {
      fail('create attempt returned incomplete upload instruction');
    }
    if (upload.uploadUrl.indexOf('.invalid') >= 0) {
      fail('Load test refuses the deterministic fake storage URL');
    }

    const uploadResponse = http.put(upload.uploadUrl, audio, {
      headers: upload.requiredHeaders || {},
      tags: { operation: 'object_upload' },
    });
    uploadDuration.add(uploadResponse.timings.duration);
    expectStatus(uploadResponse, [200, 201, 204], 'object upload');

    const sealResponse = apiRequest(
      'POST',
      '/api/v1/speaking/attempts/' + upload.attempt.id + '/upload-complete',
      { checksumSha256: audioChecksum },
      context,
      'complete_upload'
    );
    expectStatus(sealResponse, [200], 'complete upload');

    const evaluationStartedAt = Date.now();
    const evaluateResponse = apiRequest(
      'POST',
      '/api/v1/speaking/attempts/' + upload.attempt.id + '/evaluate',
      null,
      context,
      'start_evaluation',
      { 'Idempotency-Key': uuid() }
    );
    expectStatus(evaluateResponse, [202], 'start evaluation');

    const deadline = Date.now() + evaluationTimeoutSeconds * 1000;
    let evaluation = null;
    while (Date.now() < deadline) {
      const pollResponse = apiRequest(
        'GET',
        '/api/v1/speaking/attempts/' + upload.attempt.id + '/evaluation',
        null,
        context,
        'poll_evaluation'
      );
      expectStatus(pollResponse, [200], 'poll evaluation');
      evaluation = parseJson(pollResponse, 'poll evaluation');
      if (evaluation.status === 'completed' || evaluation.status === 'failed') {
        break;
      }
      sleep(pollIntervalSeconds);
    }
    evaluationEndToEnd.add(Date.now() - evaluationStartedAt);
    if (!evaluation || evaluation.status !== 'completed') {
      fail(
        'evaluation did not complete: ' +
          (evaluation && evaluation.errorCode ? evaluation.errorCode : 'timeout')
      );
    }
    if (requireRealProviders && evaluation.source === 'fake') {
      fail('Load test refuses fake evaluation results');
    }

    const completeResponse = apiRequest(
      'POST',
      '/api/v1/speaking/sessions/' + sessionId + '/complete',
      { selectedAttemptId: upload.attempt.id, expectedVersion: session.version },
      context,
      'complete_session',
      { 'Idempotency-Key': uuid() }
    );
    expectStatus(completeResponse, [200], 'complete session');
    completed = true;
    flowSuccess.add(true);
  } catch (error) {
    flowSuccess.add(false);
    throw error;
  } finally {
    if (sessionId && !completed) {
      abandonSession(context, sessionId);
    }
  }
}

export function handleSummary(data) {
  const output = {};
  output[__ENV.SUMMARY_PATH || 'speaking-load-summary.json'] = JSON.stringify(data, null, 2);
  return output;
}
