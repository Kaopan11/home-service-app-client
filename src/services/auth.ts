import { apiFetch } from '@/services/api'
import type {
  AdminUser,
  LoginRequest,
  LoginResponse,
  UserProfileResponse,
} from '@/types/auth'

export function loginAdmin(payload: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
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
