export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  idempotencyKey?: string
  skipAuthRefresh?: boolean
  timeoutMs?: number
}

export interface ApiProblem {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  code?: string
  requestId?: string
  fieldErrors?: Record<string, string>
}

type CsrfResponse = components['schemas']['CsrfResponse']
type RefreshResponse = components['schemas']['AuthResponse']
interface ValidCsrfResponse {
  headerName: string
  token: string
}

const BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')
const REQUEST_ID_HEADER = 'X-Request-Id'
const DEFAULT_TIMEOUT_MS = 15_000

let accessToken: string | null = null
let csrf: ValidCsrfResponse | null = null
let csrfRequest: Promise<ValidCsrfResponse> | null = null
let refreshRequest: Promise<void> | null = null

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
    public requestId?: string,
    public retryAfterSeconds?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiFailure {
  kind: 'timeout' | 'quota' | 'rateLimit' | 'network' | 'authentication' | 'server' | 'request'
  title: string
  message: string
  requestId?: string
  retryAfterSeconds?: number
}

function problemCode(error: ApiError): string | undefined {
  if (typeof error.data !== 'object' || error.data === null) return undefined
  return (error.data as ApiProblem).code
}

export function describeApiError(error: unknown): ApiFailure {
  if (!(error instanceof ApiError)) {
    return {
      kind: 'request',
      title: 'Không thể hoàn tất yêu cầu',
      message: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.',
    }
  }

  const code = problemCode(error)
  const metadata = {
    requestId: error.requestId,
    retryAfterSeconds: error.retryAfterSeconds,
  }
  if (error.status === 408 || code === 'REQUEST_TIMEOUT') {
    return {
      kind: 'timeout',
      title: 'Yêu cầu mất quá nhiều thời gian',
      message: 'Máy chủ chưa phản hồi kịp. Bạn có thể thử lại mà không làm trùng thao tác.',
      ...metadata,
    }
  }
  if (error.status === 429 && code === 'QUOTA_EXCEEDED') {
    return {
      kind: 'quota',
      title: 'Đã đạt giới hạn sử dụng hôm nay',
      message: error.message,
      ...metadata,
    }
  }
  if (error.status === 429) {
    return {
      kind: 'rateLimit',
      title: 'Bạn đang thao tác quá nhanh',
      message: error.retryAfterSeconds
        ? `Vui lòng thử lại sau ${error.retryAfterSeconds} giây.`
        : error.message,
      ...metadata,
    }
  }
  if (error.status === 0) {
    return {
      kind: 'network',
      title: 'Không thể kết nối máy chủ',
      message: 'Kiểm tra kết nối mạng rồi thử lại.',
      ...metadata,
    }
  }
  if (error.status === 401) {
    return {
      kind: 'authentication',
      title: 'Phiên đăng nhập đã hết hạn',
      message: 'Vui lòng đăng nhập lại để tiếp tục.',
      ...metadata,
    }
  }
  return {
    kind: error.status >= 500 ? 'server' : 'request',
    title: error.status >= 500 ? 'Dịch vụ đang gián đoạn' : 'Không thể hoàn tất yêu cầu',
    message: error.message,
    ...metadata,
  }
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  let timedOut = false
  const sourceSignal = init.signal
  const abortFromSource = () => controller.abort(sourceSignal?.reason)

  if (sourceSignal?.aborted) abortFromSource()
  else sourceSignal?.addEventListener('abort', abortFromSource, { once: true })

  const timer = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (timedOut) {
      throw new ApiError(408, 'Request timed out', { code: 'REQUEST_TIMEOUT' })
    }
    throw error
  } finally {
    window.clearTimeout(timer)
    sourceSignal?.removeEventListener('abort', abortFromSource)
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = null
}

function urlFor(endpoint: string, params?: RequestOptions['params']): string {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  if (!params) return url

  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.append(key, String(value))
  })
  const query = search.toString()
  return query ? `${url}?${query}` : url
}

function isMutation(method: string): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method)
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('json')) {
    return response.json().catch(() => undefined)
  }

  const text = await response.text()
  return text || undefined
}

async function errorFrom(response: Response): Promise<ApiError> {
  const data = await readBody(response)
  const problem = typeof data === 'object' && data !== null ? (data as ApiProblem) : undefined
  const requestId = response.headers.get(REQUEST_ID_HEADER) ?? problem?.requestId
  const retryAfter = response.headers.get('Retry-After')
  const message =
    problem?.detail ||
    problem?.title ||
    (typeof data === 'string' ? data : undefined) ||
    response.statusText ||
    'Request failed'

  return new ApiError(
    response.status,
    message,
    data,
    requestId,
    retryAfter === null ? undefined : Number(retryAfter)
  )
}

async function getCsrf(): Promise<ValidCsrfResponse> {
  if (csrf) return csrf
  if (!csrfRequest) {
    csrfRequest = fetchWithTimeout(urlFor('/auth/csrf'), {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw await errorFrom(response)
        const value = (await response.json()) as CsrfResponse
        if (!value.headerName || !value.token) {
          throw new ApiError(0, 'Invalid CSRF response')
        }
        return { headerName: value.headerName, token: value.token }
      })
      .then((value) => {
        csrf = value
        return value
      })
      .finally(() => {
        csrfRequest = null
      })
  }
  return csrfRequest
}

async function refreshAccessToken(): Promise<void> {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const csrfToken = await getCsrf()
      const response = await fetchWithTimeout(urlFor('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          [csrfToken.headerName]: csrfToken.token,
        },
      })
      if (!response.ok) {
        clearAccessToken()
        throw await errorFrom(response)
      }
      const body = (await response.json()) as RefreshResponse
      if (!body.accessToken) throw new ApiError(0, 'Invalid refresh response')
      setAccessToken(body.accessToken)
    })().finally(() => {
      refreshRequest = null
    })
  }
  return refreshRequest
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    params,
    headers: suppliedHeaders,
    idempotencyKey,
    skipAuthRefresh = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...requestInit
  } = options
  const method = (options.method || 'GET').toUpperCase()
  const url = urlFor(endpoint, params)
  const headers = new Headers(suppliedHeaders)

  headers.set('Accept', headers.get('Accept') || 'application/json')
  if (requestInit.body && !(requestInit.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey)
  if (isMutation(method)) {
    const csrfToken = await getCsrf()
    headers.set(csrfToken.headerName, csrfToken.token)
  }

  const execute = () => {
    const requestHeaders = new Headers(headers)
    const token = getAccessToken()
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`)
    return fetchWithTimeout(url, {
      ...requestInit,
      method,
      headers: requestHeaders,
      credentials: options.credentials ?? 'include',
    }, timeoutMs)
  }

  try {
    let response = await execute()
    const isAuthEndpoint = endpoint.startsWith('/auth/')
    if (response.status === 401 && !skipAuthRefresh && !isAuthEndpoint) {
      await refreshAccessToken()
      response = await execute()
    }
    if (!response.ok) throw await errorFrom(response)
    return (await readBody(response)) as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error')
  }
}

export function resetApiClientState(): void {
  accessToken = null
  csrf = null
  csrfRequest = null
  refreshRequest = null
}
import type { components } from './generated/api-schema'
