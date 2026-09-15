import type { AdminUser, AuthSession } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const EXPIRES_AT_KEY = 'expiresAt'
const USER_KEY = 'user'

export function readAuthStorage(): { session: AuthSession | null; user: AdminUser | null } {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  const expiresAtRaw = localStorage.getItem(EXPIRES_AT_KEY)
  const userRaw = localStorage.getItem(USER_KEY)

  if (!accessToken || !refreshToken || !expiresAtRaw) {
    return { session: null, user: null }
  }

  let user: AdminUser | null = null
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as AdminUser
    } catch {
      user = null
    }
  }

  return {
    session: {
      accessToken,
      refreshToken,
      expiresAt: Number(expiresAtRaw),
      tokenType: 'bearer',
    },
    user,
  }
}

export function writeAuthStorage(session: AuthSession, user: AdminUser): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  localStorage.setItem(EXPIRES_AT_KEY, String(session.expiresAt))
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}
