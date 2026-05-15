import { useAuthStore } from '../stores/authStore'
import type { ApiError } from '../types/common'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

class ApiClientError extends Error {
  constructor(public error: ApiError) {
    super(error.message)
  }
}

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setAccessToken, clearAuth } = useAuthStore.getState()
  if (!refreshToken) {
    clearAuth()
    window.location.href = '/login'
    throw new ApiClientError({ code: 'AUTH_005', message: 'No refresh token' })
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    clearAuth()
    window.location.href = '/login'
    throw new ApiClientError({ code: 'AUTH_005', message: 'Token refresh failed' })
  }

  const data = (await res.json()) as { accessToken: string }
  setAccessToken(data.accessToken)
  return data.accessToken
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    if (path.startsWith('/auth/')) {
      const body = (await res.json()) as { error: ApiError }
      throw new ApiClientError(body.error)
    }
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }

    const newToken = await refreshPromise!
    headers['Authorization'] = `Bearer ${newToken}`
    const retryRes = await fetch(`${BASE_URL}${path}`, { ...options, headers })

    if (!retryRes.ok) {
      const body = (await retryRes.json()) as { error: ApiError }
      throw new ApiClientError(body.error)
    }

    if (retryRes.status === 204) return undefined as T
    return retryRes.json() as Promise<T>
  }

  if (!res.ok) {
    const body = (await res.json()) as { error: ApiError }
    throw new ApiClientError(body.error)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
