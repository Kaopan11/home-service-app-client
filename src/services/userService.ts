import { apiFetch } from '@/services/api'
import type { UpdateUserProfileRequest, UserAddress, UserProfile, UserProfileApiResponse } from '@/types/user'

export const USER_PROFILE_STORAGE_KEY = 'home_services_user_profile'

export const DEFAULT_USER_PROFILE: UserProfile = {
  displayName: 'สมศรี',
  firstName: 'สมศรี',
  lastName: 'จันทร์อังคาร',
  email: 'somsri@example.com',
  phone: '0812345678',
  address: '452 ซอยสุขุมวิท 79',
  subdistrict: 'พระโขนงเหนือ',
  district: 'วัฒนา',
  province: 'กรุงเทพมหานคร',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80',
}

export function readCachedUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProfile>
      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
      }
    }
  } catch {
    // Ignore JSON error
  }
  return { ...DEFAULT_USER_PROFILE }
}

export function writeCachedUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile))
    // Dispatch storage event so other components/pages can react
    window.dispatchEvent(new Event('storage'))
  } catch {
    // Ignore storage errors
  }
}

export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const response = await apiFetch<UserProfileApiResponse>('/api/users/me')
    if (response?.data) {
      writeCachedUserProfile(response.data)
      return response.data
    }
  } catch {
    // Fall back to local persistent store when backend is unavailable or not logged in
  }
  return readCachedUserProfile()
}

export async function updateUserProfile(payload: UpdateUserProfileRequest): Promise<UserProfile> {
  const current = readCachedUserProfile()
  const merged: UserProfile = {
    ...current,
    ...payload,
  }

  // Always persist to local cache first
  writeCachedUserProfile(merged)

  try {
    const response = await apiFetch<UserProfileApiResponse>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    if (response?.data) {
      writeCachedUserProfile(response.data)
      return response.data
    }
  } catch {
    // Continue with locally updated profile if backend is not yet available
  }

  return merged
}

export function formatAddressSummary(addr: Partial<UserAddress>): string {
  const parts = [
    addr.address?.trim(),
    addr.subdistrict?.trim(),
    addr.district?.trim(),
    addr.province?.trim(),
  ].filter(Boolean)
  return parts.join(' ')
}

export function getSavedUserAddress(): UserAddress {
  const profile = readCachedUserProfile()
  return {
    address: profile.address,
    subdistrict: profile.subdistrict,
    district: profile.district,
    province: profile.province,
  }
}
