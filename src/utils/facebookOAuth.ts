import { API_BASE_URL } from '@/services/api'

/** กดปุ่มแล้วพาไป Spring จากนั้น Spring พาไป Facebook */
export function startFacebookLogin(): void {
  const redirectTo = `${window.location.origin}/auth/callback`
  window.location.assign(
    `${API_BASE_URL}/api/auth/facebook?redirectTo=${encodeURIComponent(redirectTo)}`,
  )
}

/** อ่าน token ที่ Facebook/Supabase ส่งกลับมาใน URL */
export function readFacebookCallbackParams(): URLSearchParams {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
  if (hash.includes('access_token') || hash.includes('error')) {
    return new URLSearchParams(hash)
  }
  return new URLSearchParams(window.location.search)
}
