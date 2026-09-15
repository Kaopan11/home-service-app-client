import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getMyProfile, loginAdmin, logoutAdmin } from '@/services/auth'
import { ApiError, type AdminUser, type AuthSession, type LoginRequest } from '@/types/auth'
import { clearAuthStorage, readAuthStorage, writeAuthStorage } from '@/utils/authStorage'

const NOT_ADMIN_MESSAGE = 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบ Admin'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const expiresAt = ref<number | null>(null)
  const isLoading = ref(false)
  const restored = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value && accessToken.value))
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function setSession(session: AuthSession, nextUser: AdminUser): void {
    accessToken.value = session.accessToken
    refreshToken.value = session.refreshToken
    expiresAt.value = session.expiresAt
    user.value = nextUser
    writeAuthStorage(session, nextUser)
  }

  function clearAuth(): void {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    expiresAt.value = null
    clearAuthStorage()
  }

  async function login(payload: LoginRequest): Promise<AdminUser> {
    isLoading.value = true
    try {
      const response = await loginAdmin(payload)
      const nextUser = response.data.user
      if (nextUser.role !== 'ADMIN') {
        clearAuth()
        throw new ApiError(403, NOT_ADMIN_MESSAGE, 'FORBIDDEN_ROLE')
      }
      setSession(response.data.session, nextUser)
      return nextUser
    } catch (error) {
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function restoreSession(): Promise<void> {
    if (restored.value) {
      return
    }

    isLoading.value = true
    try {
      const stored = readAuthStorage()
      if (!stored.session) {
        clearAuth()
        return
      }

      if (stored.session.expiresAt * 1000 <= Date.now()) {
        clearAuth()
        return
      }

      accessToken.value = stored.session.accessToken
      refreshToken.value = stored.session.refreshToken
      expiresAt.value = stored.session.expiresAt

      const profile = await getMyProfile()
      if (profile.role !== 'ADMIN') {
        clearAuth()
        return
      }

      setSession(stored.session, profile)
    } catch {
      clearAuth()
    } finally {
      restored.value = true
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await logoutAdmin()
    } catch {
      // Always clear local session, even if logout API fails.
    } finally {
      clearAuth()
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    expiresAt,
    isLoading,
    restored,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    restoreSession,
    clearAuth,
  }
})
