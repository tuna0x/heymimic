/**
 * Base API Client Configuration
 * Ready to integrate with backend via VITE_API_URL or default fallback.
 */

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options

  const token = localStorage.getItem('mimic_auth_token')
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) searchParams.append(key, String(val))
    })
    const query = searchParams.toString()
    if (query) url += `?${query}`
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null)
      throw new ApiError(response.status, errorBody?.message || response.statusText, errorBody)
    }
    return (await response.json()) as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    // When backend is not yet available, caller services provide fallback mocks seamlessly
    throw new ApiError(0, (err as Error).message || 'Network error')
  }
}
