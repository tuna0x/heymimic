import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  apiClient,
  describeApiError,
  resetApiClientState,
  setAccessToken,
} from '../api'

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

describe('apiClient', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    localStorage.clear()
    resetApiClientState()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('sends the access token and parses JSON responses', async () => {
    setAccessToken('access-token')
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'user-1' }))

    await expect(apiClient<{ id: string }>('/me')).resolves.toEqual({ id: 'user-1' })

    const [, init] = fetchMock.mock.calls[0]
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer access-token')
    expect(init?.credentials).toBe('include')
  })

  it('loads CSRF for mutations and does not force multipart Content-Type', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ headerName: 'X-CSRF-TOKEN', token: 'csrf-token' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    const body = new FormData()
    body.append('audio', new Blob(['voice'], { type: 'audio/webm' }))

    await expect(
      apiClient<void>('/upload', { method: 'POST', body })
    ).resolves.toBeUndefined()

    const [, init] = fetchMock.mock.calls[1]
    const headers = new Headers(init?.headers)
    expect(headers.get('X-CSRF-TOKEN')).toBe('csrf-token')
    expect(headers.has('Content-Type')).toBe(false)
  })

  it('refreshes only once after 401 and preserves the idempotency key', async () => {
    setAccessToken('expired-token')
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ headerName: 'X-CSRF-TOKEN', token: 'csrf-token' }))
      .mockResolvedValueOnce(
        jsonResponse(
          { detail: 'Expired' },
          { status: 401, statusText: 'Unauthorized' }
        )
      )
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'fresh-token' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'session-1' }, { status: 201 }))

    await expect(
      apiClient<{ id: string }>('/speaking/sessions', {
        method: 'POST',
        body: JSON.stringify({ topicId: 'topic-1' }),
        idempotencyKey: 'request-1',
      })
    ).resolves.toEqual({ id: 'session-1' })

    expect(fetchMock).toHaveBeenCalledTimes(4)
    const retriedHeaders = new Headers(fetchMock.mock.calls[3][1]?.headers)
    expect(retriedHeaders.get('Authorization')).toBe('Bearer fresh-token')
    expect(retriedHeaders.get('Idempotency-Key')).toBe('request-1')
  })

  it('does not refresh authentication endpoints', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ headerName: 'X-CSRF-TOKEN', token: 'csrf-token' }))
      .mockResolvedValueOnce(
        jsonResponse(
          { detail: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
          { status: 401, statusText: 'Unauthorized' }
        )
      )

    await expect(
      apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@example.com', password: 'invalid' }),
      })
    ).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('keeps plain-text errors, request id and retry-after metadata', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('Provider unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'text/plain',
          'X-Request-Id': 'req-123',
          'Retry-After': '4',
        },
      })
    )

    const error = await apiClient('/health/provider').catch((value) => value)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 503,
      message: 'Provider unavailable',
      requestId: 'req-123',
      retryAfterSeconds: 4,
    })
  })

  it('aborts a request at the configured timeout', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementationOnce((_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    )

    const assertion = expect(
      apiClient('/slow', { timeoutMs: 25 })
    ).rejects.toMatchObject({
      status: 408,
      data: { code: 'REQUEST_TIMEOUT' },
    })
    await vi.advanceTimersByTimeAsync(25)
    await assertion
  })

  it('classifies quota responses separately from generic rate limits', () => {
    const failure = describeApiError(
      new ApiError(
        429,
        'Daily evaluation quota reached',
        { code: 'QUOTA_EXCEEDED' },
        'req-quota'
      )
    )

    expect(failure).toMatchObject({
      kind: 'quota',
      title: 'Đã đạt giới hạn sử dụng hôm nay',
      requestId: 'req-quota',
    })
  })
})
