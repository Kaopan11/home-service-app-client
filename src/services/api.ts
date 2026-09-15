import { ApiError, type ApiFieldError } from '@/types/auth'
import { clearAuthStorage, getStoredAccessToken } from '@/utils/authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const PUBLIC_AUTH_PATHS = ['/api/auth/login', '/api/auth/logout']

type ApiErrorBody = {
  message?: string
  code?: string
  errors?: ApiFieldError[]
}

async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody
    return new ApiError(
      response.status,
      body.message || defaultErrorMessage(response.status),
      body.code,
      body.errors,
    )
  } catch {
    return new ApiError(response.status, defaultErrorMessage(response.status))
  }
}

function defaultErrorMessage(status: number): string {
  if (status === 401) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  }
  return `API error: ${status}`
}

async function redirectToLoginIfUnauthorized(path: string, status: number): Promise<void> {
  if (status !== 401 || PUBLIC_AUTH_PATHS.includes(path)) {
    return
  }

  clearAuthStorage()

  const { default: router } = await import('@/router')
  if (router.currentRoute.value.path !== '/admin/login') {
    await router.replace('/admin/login')
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getStoredAccessToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new ApiError(0, 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
  }

  if (!response.ok) {
    const error = await parseApiError(response)
    await redirectToLoginIfUnauthorized(path, response.status)
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}
