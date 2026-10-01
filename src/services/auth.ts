import { API_BASE_URL, apiFetch } from '@/services/api'
import type {
  AdminUser,
  FacebookLoginRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserProfileResponse,
} from '@/types/auth'

export function loginWithPassword(payload: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerUser(payload: RegisterRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginWithFacebook(payload: FacebookLoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/facebook', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** กดปุ่มแล้วพาไป Spring จากนั้น Spring พาไป Facebook */
export function startFacebookLogin(): void {
  const redirectTo = `${window.location.origin}/auth/callback`
  window.location.assign(
    `${API_BASE_URL}/api/auth/facebook?redirectTo=${encodeURIComponent(redirectTo)}`,
  )
}

export function loginAdmin(payload: LoginRequest): Promise<LoginResponse> {
  return loginWithPassword(payload)
}

export async function getMyProfile(): Promise<AdminUser> {
  const response = await apiFetch<UserProfileResponse>('/api/users/me')
  return response.data
}

export async function logoutAdmin(): Promise<void> {
  await apiFetch<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  })
}
