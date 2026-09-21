import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginWithPassword, logoutAdmin, registerUser } from '@/services/auth'
import { USER_PROFILE_STORAGE_KEY } from '@/services/userService'
import { ApiError, type AdminUser, type AuthSession, type LoginRequest, type RegisterRequest } from '@/types/auth'
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
  const isTechnician = computed(() => user.value?.role === 'TECHNICIAN')

  function setSession(session: AuthSession, nextUser: AdminUser): void {
    accessToken.value = session.accessToken
    refreshToken.value = session.refreshToken
    expiresAt.value = session.expiresAt
    user.value = nextUser
    writeAuthStorage(session, nextUser)
  }

  function applyLoginResponse(response: { data: { user: AdminUser; session: AuthSession | null } }): AdminUser {
    const nextUser = response.data.user
    const session = response.data.session
    if (!session?.accessToken) {
      throw new ApiError(401, 'ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ')
    }
    setSession(session, nextUser)
    return nextUser
  }

  function clearAuth(): void {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    expiresAt.value = null
    clearAuthStorage()
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY)
  }

  function updateUser(nextUser: AdminUser): void {
    user.value = nextUser
    if (accessToken.value && refreshToken.value && expiresAt.value != null) {
      writeAuthStorage(
        {
          accessToken: accessToken.value,
          refreshToken: refreshToken.value,
          expiresAt: expiresAt.value,
          tokenType: 'bearer',
        },
        nextUser,
      )
    }
  }

  async function login(payload: LoginRequest): Promise<AdminUser> {
    isLoading.value = true
    try {
      const nextUser = applyLoginResponse(await loginWithPassword(payload))
      if (nextUser.role !== 'ADMIN') {
        clearAuth()
        throw new ApiError(403, NOT_ADMIN_MESSAGE, 'FORBIDDEN_ROLE')
      }
      return nextUser
    } catch (error) {
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function loginCustomer(payload: LoginRequest): Promise<AdminUser> {
    isLoading.value = true
    try {
      return applyLoginResponse(await loginWithPassword(payload))
    } catch (error) {
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterRequest): Promise<AdminUser> {
    isLoading.value = true
    try {
      return applyLoginResponse(await registerUser(payload))
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

      if (stored.session.expiresAt * 1000 <= Date.now() || !stored.user) {
        clearAuth()
        return
      }

      setSession(stored.session, stored.user)
    } catch {
      clearAuth()
    } finally {
      restored.value = true
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    const request = logoutAdmin()
    clearAuth()
    try {
      await request
    } catch {
      // Local session is already cleared.
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
    isTechnician,
    login,
    loginCustomer,
    register,
    logout,
    restoreSession,
    updateUser,
    clearAuth,
  }
})
