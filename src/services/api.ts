import { ApiError } from '@/types/auth'
import { getStoredAccessToken } from '@/utils/authStorage'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/register',
  '/api/services',
]

type ApiErrorBody = {
  message?: string
  code?: string
  errors?: { field?: string; message: string }[]
}


async function parseApiError(response: Response, path: string): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody
    return new ApiError(
      response.status,
      body.message || body.errors?.[0]?.message || defaultErrorMessage(response.status, path),
      body.code,
      body.errors?.map((item) => ({ field: item.field ?? '', message: item.message })),
    )
  } catch {
    return new ApiError(response.status, defaultErrorMessage(response.status, path))
  }
}

function defaultErrorMessage(status: number, path: string): string {
  if (status === 401 && path === '/api/auth/login') {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  }
  if (status === 401) {
    return 'กรุณาเข้าสู่ระบบอีกครั้ง'
  }
  if (status === 409) {
    return 'อีเมลนี้ถูกใช้แล้ว'
  }
  return `API error: ${status}`
}

async function redirectToLoginIfUnauthorized(path: string, status: number): Promise<void> {
  if (status !== 401 || PUBLIC_AUTH_PATHS.includes(path)) {
    return
  }

  const { default: router } = await import('@/router')
  const current = router.currentRoute.value
  const pathName = current.path
  const { useAuthStore } = await import('@/stores/auth')

  if (pathName.startsWith('/admin')) {
    if (pathName === '/admin/login') {
      return
    }
    useAuthStore().clearAuth()
    await router.replace('/admin/login')
    return
  }

  // Customer session expired or rejected: drop it, and bounce if the page needs login.
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return
  }
  auth.clearAuth()
  if (current.meta.requiresAuth) {
    await router.replace({ name: 'login', query: { redirect: current.fullPath } })
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
    const error = await parseApiError(response, path)
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
